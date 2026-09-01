import type { AmbientScene } from '../types';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const ambientScenes: AmbientScene[] = [
  {
    id: 'ocean', label: 'Ocean',
    lightImage: asset('ambient/light/ocean-sunrise.webp'),
    darkImage: asset('ambient/dark/ocean-moonlight.webp'),
    duration: 24000, transitionDuration: 3400, focalPoint: 'center',
  },
  {
    id: 'lake', label: 'Lake',
    lightImage: asset('ambient/light/mountain-lake.webp'),
    darkImage: asset('ambient/dark/mountain-lake-night.webp'),
    duration: 26000, transitionDuration: 3600, focalPoint: 'center',
  },
  {
    id: 'garden', label: 'Garden',
    lightImage: asset('ambient/light/meditation-garden.webp'),
    darkImage: asset('ambient/dark/meditation-garden-night.webp'),
    duration: 28000, transitionDuration: 3800, focalPoint: 'center',
  },
  {
    id: 'terrace', label: 'Terrace',
    lightImage: asset('ambient/light/coastal-terrace.webp'),
    darkImage: asset('ambient/dark/coastal-terrace-twilight.webp'),
    duration: 25000, transitionDuration: 3400, focalPoint: 'center',
  },
  {
    id: 'sky', label: 'Open sky',
    lightImage: asset('ambient/light/open-sky.webp'),
    darkImage: asset('ambient/dark/starlight-sky.webp'),
    duration: 27000, transitionDuration: 3600, focalPoint: 'center',
  },
];
