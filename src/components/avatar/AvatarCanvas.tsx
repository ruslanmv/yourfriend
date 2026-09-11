import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation';
import { avatarConfig } from '../../config/avatar';
import { avatarQuality } from './AvatarQuality';
import { fitCameraToObject, isObjectMeaningfullyFramed } from './avatarFraming';

type WaitingMotionState = 'loading' | 'ready' | 'fallback';

export default function AvatarCanvas({ active, onReady, onError }: { active: boolean; onReady: () => void; onError: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let vrm: VRM | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let waitingMotionState: WaitingMotionState = 'loading';
    let stableFrames = 0;
    let readySent = false;
    let wasActive = false;
    let contextLost = false;
    let renderErrorReported = false;
    let baseY = 0;
    const baseRotationY = Math.PI;
    const quality = avatarQuality();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    let renderer: THREE.WebGLRenderer;

    const resetReadiness = () => {
      stableFrames = 0;
      readySent = false;
    };

    const fitAvatar = () => {
      if (!vrm) return false;
      return fitCameraToObject(camera, vrm.scene) !== null;
    };

    const useFallbackMotion = () => {
      waitingMotionState = 'fallback';
      mixer?.stopAllAction();
      mixer = null;
      if (vrm) {
        vrm.scene.rotation.y = baseRotationY;
        vrm.scene.position.y = baseY;
      }
      resetReadiness();
    };

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      resetReadiness();
      onError();
    };
    const handleContextRestored = () => {
      contextLost = false;
      renderErrorReported = false;
      resetReadiness();
      fitAvatar();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x22314d, 2.2));
    const key = new THREE.DirectionalLight(0xfff4e6, 3.2); key.position.set(-2, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7f94ff, 2); rim.position.set(3, 2, -2); scene.add(rim);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      if (vrm) {
        fitAvatar();
        resetReadiness();
      }
    };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    loader.load(avatarConfig.model, (gltf) => {
      if (disposed) return;
      vrm = gltf.userData.vrm as VRM;
      if (!vrm) { onError(); return; }
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      VRMUtils.rotateVRM0(vrm);
      scene.add(vrm.scene);
      vrm.scene.rotation.y = baseRotationY;
      vrm.scene.position.set(0, 0, 0);
      baseY = vrm.scene.position.y;
      vrm.update(0);
      vrm.scene.updateMatrixWorld(true);
      if (!fitAvatar()) {
        resetReadiness();
        onError();
        return;
      }
      resetReadiness();

      loader.load(
        avatarConfig.animations.waiting,
        (animationGltf) => {
          if (disposed || !vrm) return;
          try {
            const vrmAnimation = animationGltf.userData.vrmAnimations?.[0];
            if (!vrmAnimation) {
              useFallbackMotion();
              return;
            }

            vrm.scene.rotation.y = baseRotationY;
            vrm.scene.position.y = baseY;
            const clip = createVRMAnimationClip(vrmAnimation, vrm);
            mixer?.stopAllAction();
            mixer = new THREE.AnimationMixer(vrm.scene);
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
            waitingMotionState = 'ready';
            resetReadiness();
          } catch {
            useFallbackMotion();
          }
        },
        undefined,
        () => {
          if (!disposed) useFallbackMotion();
        },
      );
    }, undefined, () => {
      if (!disposed) {
        resetReadiness();
        onError();
      }
    });

    const clock = new THREE.Clock();
    let raf = 0;
    let lastFrame = 0;
    const frameInterval = 1000 / quality.fps;
    const render = (time: number) => {
      raf = requestAnimationFrame(render);
      if (!activeRef.current) {
        wasActive = false;
        return;
      }
      if (!wasActive) {
        wasActive = true;
        resetReadiness();
        clock.getDelta();
        fitAvatar();
      }
      if (contextLost || time - lastFrame < frameInterval) return;
      lastFrame = time;

      try {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.elapsedTime;
        if (vrm) {
          if (mixer) {
            mixer.update(delta);
          } else if (waitingMotionState === 'fallback') {
            vrm.scene.rotation.y = baseRotationY + Math.sin(elapsed * 0.22) * 0.018;
            vrm.scene.position.y = baseY + Math.sin(elapsed * 0.85) * 0.006;
          }
          vrm.update(delta);
        }
        renderer.render(scene, camera);
        renderErrorReported = false;
      } catch {
        resetReadiness();
        if (!renderErrorReported) {
          renderErrorReported = true;
          onError();
        }
        return;
      }

      if (!vrm || readySent) return;
      const rect = mount.getBoundingClientRect();
      const canvasReady = rect.width >= 32 && rect.height >= 32 && renderer.domElement.width > 0 && renderer.domElement.height > 0 && vrm.scene.visible;
      const motionReady = waitingMotionState !== 'loading';
      const visibleFrame = motionReady && canvasReady && isObjectMeaningfullyFramed(camera, vrm.scene, 0.55);
      stableFrames = visibleFrame ? stableFrames + 1 : 0;
      if (stableFrames >= avatarConfig.transition.stableFrames) {
        readySent = true;
        onReady();
      }
    };
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      mixer?.stopAllAction();
      if (mixer && vrm) mixer.uncacheRoot(vrm.scene);
      renderer.dispose();
      renderer.domElement.remove();
      vrm?.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose()); else material?.dispose?.();
      });
    };
  }, [onError, onReady]);

  return <div ref={mountRef} className="avatar-canvas" aria-hidden="true"/>;
}
