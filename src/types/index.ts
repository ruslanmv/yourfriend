export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

export interface AmbientScene {
  id: string;
  label: string;
  lightImage: string;
  darkImage: string;
  duration: number;
  transitionDuration: number;
  focalPoint?: string;
}

export interface Experience {
  id: string;
  icon: 'watch' | 'screen' | 'game' | 'home';
  title: string;
  body: string;
}
