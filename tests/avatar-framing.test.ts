import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { fitCameraToObject, isObjectMeaningfullyFramed } from '../src/components/avatar/avatarFraming';

describe('avatar camera framing', () => {
  it('centers a human-scale model in the camera without hard-coded root offsets', () => {
    const avatar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.8, 0.35), new THREE.MeshBasicMaterial());
    avatar.position.y = 0.9;
    const camera = new THREE.PerspectiveCamera(30, 0.9, 0.01, 50);

    const result = fitCameraToObject(camera, avatar);

    expect(result).not.toBeNull();
    expect(result!.size.y).toBeCloseTo(1.8, 5);
    expect(camera.position.y).toBeGreaterThan(0.8);
    expect(isObjectMeaningfullyFramed(camera, avatar, 0.55)).toBe(true);
  });

  it('reserves extra headroom so the face cannot sit on the top frame edge', () => {
    const avatar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.8, 0.35), new THREE.MeshBasicMaterial());
    avatar.position.y = 0.9;
    const camera = new THREE.PerspectiveCamera(30, 0.9, 0.01, 50);

    const result = fitCameraToObject(camera, avatar);

    expect(result).not.toBeNull();
    expect(result!.target.y).toBeGreaterThan(result!.center.y);

    const top = new THREE.Vector3(result!.center.x, result!.box.max.y, result!.center.z).project(camera);
    const bottom = new THREE.Vector3(result!.center.x, result!.box.min.y, result!.center.z).project(camera);
    expect(top.y).toBeLessThan(0.85);
    expect(bottom.y).toBeGreaterThan(-1);
  });

  it('reframes correctly after a wide responsive resize', () => {
    const avatar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.75, 0.4), new THREE.MeshBasicMaterial());
    avatar.position.y = 0.875;
    const camera = new THREE.PerspectiveCamera(30, 0.65, 0.01, 50);

    expect(fitCameraToObject(camera, avatar)).not.toBeNull();
    expect(isObjectMeaningfullyFramed(camera, avatar, 0.5)).toBe(true);

    camera.aspect = 1.6;
    camera.updateProjectionMatrix();
    expect(fitCameraToObject(camera, avatar)).not.toBeNull();
    expect(isObjectMeaningfullyFramed(camera, avatar, 0.5)).toBe(true);
  });
});
