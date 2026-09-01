import type { AmbientScene } from '../types';

export const ambientScenes: AmbientScene[] = [
  {
    id: 'ocean', label: 'Ocean',
    lightImage: '/ambient/light/ocean-sunrise.webp',
    darkImage: '/ambient/dark/ocean-moonlight.webp',
    duration: 24000, transitionDuration: 3400, focalPoint: 'center',
  },
  {
    id: 'lake', label: 'Lake',
    lightImage: '/ambient/light/mountain-lake.webp',
    darkImage: '/ambient/dark/mountain-lake-night.webp',
    duration: 26000, transitionDuration: 3600, focalPoint: 'center',
  },
  {
    id: 'garden', label: 'Garden',
    lightImage: '/ambient/light/meditation-garden.webp',
    darkImage: '/ambient/dark/meditation-garden-night.webp',
    duration: 28000, transitionDuration: 3800, focalPoint: 'center',
  },
  {
    id: 'terrace', label: 'Terrace',
    lightImage: '/ambient/light/coastal-terrace.webp',
    darkImage: '/ambient/dark/coastal-terrace-twilight.webp',
    duration: 25000, transitionDuration: 3400, focalPoint: 'center',
  },
  {
    id: 'sky', label: 'Open sky',
    lightImage: '/ambient/light/open-sky.webp',
    darkImage: '/ambient/dark/starlight-sky.webp',
    duration: 27000, transitionDuration: 3600, focalPoint: 'center',
  },
];
