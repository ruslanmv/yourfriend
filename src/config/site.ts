import type { Experience } from '../types';

export const site = {
  name: 'YourFriend',
  domain: 'yourfriend.online',
  salesEmail: import.meta.env.VITE_SALES_EMAIL || 'hello@yourfriend.online',
  appUrl: import.meta.env.VITE_APP_URL || 'https://www.yourfriend.online/',
};

export const navItems = [
  { label: 'Product', href: '#product' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
];

export const experiences: Experience[] = [
  {
    id: 'watch', icon: 'watch', title: 'Watch Together',
    body: 'Share shows, movies, and videos. YourFriend reacts, remembers, and stays in the moment with you.',
  },
  {
    id: 'screen', icon: 'screen', title: 'Screen Copilot',
    body: 'A calm assistant on your screen. Explain, summarize, find, and get things done—together.',
  },
  {
    id: 'gaming', icon: 'game', title: 'Gaming Co-host',
    body: 'Strategy, banter, hype. YourFriend is in your corner—aware of the game and the moment.',
  },
  {
    id: 'home', icon: 'home', title: 'Embodied HomePilot',
    body: 'Your digital tools become embodied presence—helpful when you ask and quiet when you do not.',
  },
];
