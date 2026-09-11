import * as THREE from 'three';
import type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
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
  object: THREE.Object3D;
};

function transformedQuaternionValues(values: ArrayLike<number>, flipHandedness: boolean) {
  const next = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    const component = index % 4;
    const value = values[index];
    next[index] = flipHandedness && (component === 0 || component === 2) ? -value : value;
  }
  return next;
}

function transformedHipsValues(values: ArrayLike<number>, scale: number, flipHandedness: boolean) {
  const next = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    const component = index % 3;
    const value = values[index] * scale;
    next[index] = flipHandedness && component !== 1 ? -value : value;
  }
  return next;
}

/**
 * Retarget one VRMC_vrm_animation clip onto the normalized humanoid bones of
 * the hero VRM. This follows Pixiv's VRMA pipeline for the skeletal tracks we
 * need on the marketing page: humanoid rotations plus scaled hips translation.
 * Expression/look-at tracks are intentionally left for the micro-presence pass.
 */
export async function createWaitingAnimationClip(gltf: GLTF, vrm: VRM): Promise<THREE.AnimationClip | null> {
  const json = gltf.parser.json as VRMAJson;
  const extension = json.extensions?.VRMC_vrm_animation;
  const sourceClip = gltf.animations[0];
  const humanBones = extension?.humanoid?.humanBones;
  if (!extension || !sourceClip || !humanBones) return null;

  gltf.scene.updateWorldMatrix(false, true);

  const sourceBones = new Map<string, SourceBone>();
  let sourceHips: THREE.Object3D | null = null;
  for (const [boneName, boneDefinition] of Object.entries(humanBones)) {
    const nodeIndex = boneDefinition?.node;
    if (nodeIndex == null) continue;
    const sourceObject = await gltf.parser.getDependency('node', nodeIndex) as THREE.Object3D;
    if (!sourceObject?.name) continue;
    const humanBoneName = boneName as VRMHumanBoneName;
    sourceBones.set(sourceObject.name, { name: humanBoneName, object: sourceObject });
    if (humanBoneName === 'hips') sourceHips = sourceObject;
  }

  if (sourceBones.size === 0) return null;

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
      track.values = transformedQuaternionValues(sourceTrack.values, flipHandedness);
      retargetedTracks.push(track);
      continue;
    }

    if (sourceBone.name === 'hips' && parsed.propertyName === 'position') {
      const track = sourceTrack.clone();
      track.name = `${targetBone.name}.position`;
      track.values = transformedHipsValues(sourceTrack.values, hipsScale, flipHandedness);
      retargetedTracks.push(track);
    }
  }

  if (retargetedTracks.length === 0) return null;
  return new THREE.AnimationClip('waiting-standard', sourceClip.duration, retargetedTracks);
}
