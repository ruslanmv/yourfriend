import * as THREE from 'three';
import { VRMHumanBoneParentMap, type VRM, type VRMHumanBoneName } from '@pixiv/three-vrm';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

type VRMANode = {
  node?: number;
};

type VRMAExtension = {
  specVersion?: string;
  humanoid?: {
    humanBones?: Partial<Record<VRMHumanBoneName, VRMANode>>;
  };
};

type VRMAJson = {
  extensions?: {
    VRMC_vrm_animation?: VRMAExtension;
  };
};

type SourceBone = {
  name: VRMHumanBoneName;
  worldQuaternionInverse: THREE.Quaternion;
  parentWorldQuaternion: THREE.Quaternion;
  parentWorldMatrix: THREE.Matrix4;
};

const IDENTITY_MATRIX = new THREE.Matrix4();

function transformedQuaternionValues(
  values: ArrayLike<number>,
  sourceBone: SourceBone,
  flipHandedness: boolean,
) {
  const next = new Float32Array(values.length);
  const sourceQuaternion = new THREE.Quaternion();

  for (let index = 0; index + 3 < values.length; index += 4) {
    sourceQuaternion
      .fromArray(values, index)
      .premultiply(sourceBone.parentWorldQuaternion)
      .multiply(sourceBone.worldQuaternionInverse);

    next[index] = flipHandedness ? -sourceQuaternion.x : sourceQuaternion.x;
    next[index + 1] = sourceQuaternion.y;
    next[index + 2] = flipHandedness ? -sourceQuaternion.z : sourceQuaternion.z;
    next[index + 3] = sourceQuaternion.w;
  }

  return next;
}

function transformedHipsValues(
  values: ArrayLike<number>,
  sourceBone: SourceBone,
  scale: number,
  flipHandedness: boolean,
) {
  const next = new Float32Array(values.length);
  const sourcePosition = new THREE.Vector3();

  for (let index = 0; index + 2 < values.length; index += 3) {
    sourcePosition.fromArray(values, index).applyMatrix4(sourceBone.parentWorldMatrix);
    next[index] = (flipHandedness ? -sourcePosition.x : sourcePosition.x) * scale;
    next[index + 1] = sourcePosition.y * scale;
    next[index + 2] = (flipHandedness ? -sourcePosition.z : sourcePosition.z) * scale;
  }

  return next;
}

/**
 * Retarget one VRMC_vrm_animation clip onto the normalized humanoid bones of
 * the hero VRM. The transforms mirror Pixiv's VRMA pipeline for humanoid
 * rotations and hips translation, including rest-pose basis conversion,
 * VRM0 handedness correction, and hips-height normalization.
 *
 * Expression/look-at tracks stay out of this focused marketing idle; those are
 * better layered deliberately in the micro-presence pass.
 */
export async function createWaitingAnimationClip(gltf: GLTF, vrm: VRM): Promise<THREE.AnimationClip | null> {
  const json = gltf.parser.json as VRMAJson;
  const extension = json.extensions?.VRMC_vrm_animation;
  const sourceClip = gltf.animations[0];
  const humanBones = extension?.humanoid?.humanBones;
  if (!extension || !sourceClip || !humanBones) return null;

  const boneObjects = new Map<VRMHumanBoneName, THREE.Object3D>();
  for (const [boneName, boneDefinition] of Object.entries(humanBones)) {
    const nodeIndex = boneDefinition?.node;
    if (nodeIndex == null) continue;
    const sourceObject = await gltf.parser.getDependency('node', nodeIndex) as THREE.Object3D;
    if (!sourceObject) continue;
    boneObjects.set(boneName as VRMHumanBoneName, sourceObject);
  }

  if (boneObjects.size === 0) return null;
  gltf.scene.updateWorldMatrix(false, true);

  const sourceBones = new Map<string, SourceBone>();
  for (const [boneName, object] of boneObjects) {
    let parentBoneName: VRMHumanBoneName | null = VRMHumanBoneParentMap[boneName];
    while (parentBoneName != null && !boneObjects.has(parentBoneName)) {
      parentBoneName = VRMHumanBoneParentMap[parentBoneName];
    }

    const parentWorldMatrix = parentBoneName == null
      ? object.parent?.matrixWorld ?? IDENTITY_MATRIX
      : boneObjects.get(parentBoneName)?.matrixWorld ?? IDENTITY_MATRIX;

    const worldQuaternion = new THREE.Quaternion();
    const parentWorldQuaternion = new THREE.Quaternion();
    const scratchPosition = new THREE.Vector3();
    const scratchScale = new THREE.Vector3();
    object.matrixWorld.decompose(scratchPosition, worldQuaternion, scratchScale);
    parentWorldMatrix.decompose(scratchPosition, parentWorldQuaternion, scratchScale);

    sourceBones.set(object.name, {
      name: boneName,
      worldQuaternionInverse: worldQuaternion.invert(),
      parentWorldQuaternion,
      parentWorldMatrix: parentWorldMatrix.clone(),
    });
  }

  const sourceHips = boneObjects.get('hips');
  const sourceHipsPosition = new THREE.Vector3();
  sourceHips?.getWorldPosition(sourceHipsPosition);
  const targetRestHipsY = vrm.humanoid.normalizedRestPose.hips?.position?.[1] ?? 0;
  const hipsScale = Math.abs(sourceHipsPosition.y) > 1e-4 && Math.abs(targetRestHipsY) > 1e-4
    ? targetRestHipsY / sourceHipsPosition.y
    : 1;
  const flipHandedness = vrm.meta.metaVersion === '0';

  const retargetedTracks: THREE.KeyframeTrack[] = [];
  for (const sourceTrack of sourceClip.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(sourceTrack.name);
    const sourceBone = parsed.nodeName ? sourceBones.get(parsed.nodeName) : undefined;
    if (!sourceBone) continue;

    const targetBone = vrm.humanoid.getNormalizedBoneNode(sourceBone.name);
    if (!targetBone) continue;

    if (parsed.propertyName === 'quaternion') {
      const track = sourceTrack.clone();
      track.name = `${targetBone.name}.quaternion`;
      track.values = transformedQuaternionValues(sourceTrack.values, sourceBone, flipHandedness);
      retargetedTracks.push(track);
      continue;
    }

    if (sourceBone.name === 'hips' && parsed.propertyName === 'position') {
      const track = sourceTrack.clone();
      track.name = `${targetBone.name}.position`;
      track.values = transformedHipsValues(sourceTrack.values, sourceBone, hipsScale, flipHandedness);
      retargetedTracks.push(track);
    }
  }

  if (retargetedTracks.length === 0) return null;
  return new THREE.AnimationClip('waiting-standard', sourceClip.duration, retargetedTracks);
}
