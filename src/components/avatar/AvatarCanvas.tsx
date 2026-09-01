import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

export function AvatarCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let vrm: VRM | null = null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 1.35, 3.1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x22314d, 2.2));
    const key = new THREE.DirectionalLight(0xfff4e6, 3.2); key.position.set(-2, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7f94ff, 2.0); rim.position.set(3, 2, -2); scene.add(rim);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load('/avatar/models/companion.vrm', (gltf) => {
      if (disposed) return;
      vrm = gltf.userData.vrm as VRM;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      VRMUtils.rotateVRM0(vrm);
      scene.add(vrm.scene);
      vrm.scene.rotation.y = Math.PI;
      vrm.scene.position.y = -0.85;
    }, undefined, () => !disposed && setFailed(true));

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      if (vrm) {
        vrm.scene.rotation.y = Math.PI + Math.sin(elapsed * 0.22) * 0.018;
        vrm.scene.position.y = -0.85 + Math.sin(elapsed * 0.85) * 0.006;
        vrm.update(clock.getDelta());
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      renderer.dispose(); renderer.domElement.remove();
      vrm?.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material?.dispose?.();
      });
    };
  }, []);

  if (failed) return null;
  return <div ref={mountRef} className="avatar-canvas" aria-hidden="true"/>;
}
