import * as THREE from 'three';

export interface AvatarFrameResult {
  box: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
  target: THREE.Vector3;
  distance: number;
}

const finiteVector = (value: THREE.Vector3) => Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);

export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  padding = 1.14,
  verticalBias = 0.03,
): AvatarFrameResult | null {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  if (!finiteVector(size) || !finiteVector(center) || size.y <= 0) return null;

  const aspect = Math.max(camera.aspect || 1, 0.01);
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const distanceForHeight = (size.y / 2) / Math.tan(verticalFov / 2);
  const distanceForWidth = (size.x / 2) / Math.tan(horizontalFov / 2);
  const distance = Math.max(distanceForHeight, distanceForWidth) * padding;
  const target = new THREE.Vector3(center.x, center.y + size.y * verticalBias, center.z);

  camera.position.set(target.x, target.y, center.z + distance);
  camera.near = Math.max(0.01, distance - size.length() * 1.5);
  camera.far = Math.max(camera.near + 10, distance + size.length() * 3);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  return { box, size, center, target, distance };
}

export function isObjectMeaningfullyFramed(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  minimumVisibleHeight = 0.5,
): boolean {
  object.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return false;

  const { min, max } = box;
  const corners = [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ].map((point) => point.project(camera));

  if (corners.some((point) => !finiteVector(point))) return false;

  const minX = Math.min(...corners.map((point) => point.x));
  const maxX = Math.max(...corners.map((point) => point.x));
  const minY = Math.min(...corners.map((point) => point.y));
  const maxY = Math.max(...corners.map((point) => point.y));
  const visibleWidth = Math.min(1, maxX) - Math.max(-1, minX);
  const visibleHeight = Math.min(1, maxY) - Math.max(-1, minY);
  const intersectsViewport = maxX > -1 && minX < 1 && maxY > -1 && minY < 1;

  return intersectsViewport && visibleHeight >= minimumVisibleHeight && visibleWidth > 0.08;
}
