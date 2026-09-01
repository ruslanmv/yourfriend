import type { ReactNode, SVGProps } from 'react';

type IconName = 'watch' | 'screen' | 'game' | 'home' | 'sound' | 'person' | 'brain' | 'leaf' | 'camera' | 'shield' | 'lock' | 'play' | 'arrow' | 'sun' | 'moon' | 'system' | 'menu' | 'close';

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props };
  const paths: Record<IconName, ReactNode> = {
    watch: <><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    screen: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M8 5h.01M11 5h.01"/></>,
    game: <><path d="M7 8h10a4 4 0 0 1 3.7 5.5l-1.1 2.8a2.4 2.4 0 0 1-3.9.8L14 15h-4l-1.7 2.1a2.4 2.4 0 0 1-3.9-.8l-1.1-2.8A4 4 0 0 1 7 8Z"/><path d="M7 12h4M9 10v4M16.5 11.5h.01M18.5 13.5h.01"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    sound: <><path d="M4 9v6M8 6v12M12 3v18M16 7v10M20 10v4"/></>,
    person: <><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
    brain: <><path d="M9.5 4A3.5 3.5 0 0 0 6 7.5v.2A3.8 3.8 0 0 0 4 11a3.6 3.6 0 0 0 2 3.3v.2A3.5 3.5 0 0 0 9.5 18H12V4Z"/><path d="M14.5 4A3.5 3.5 0 0 1 18 7.5v.2a3.8 3.8 0 0 1 2 3.3 3.6 3.6 0 0 1-2 3.3v.2a3.5 3.5 0 0 1-3.5 3.5H12V4M8 10h4M12 14h4"/></>,
    leaf: <><path d="M20 4C12 4 6 8 6 14c0 3 2 5 5 5 6 0 9-7 9-15Z"/><path d="M4 21c3-7 8-10 13-12"/></>,
    camera: <><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2"/></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    play: <path d="m9 7 8 5-8 5Z"/>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"/>,
    system: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg aria-hidden="true" {...common}>{paths[name]}</svg>;
}
