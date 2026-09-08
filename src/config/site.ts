import type { Experience } from '../types';

export const site = {
  name: 'YourFriend',
  projectName: '3D Avatar Chatbot',
  domain: 'ruslanmv.com/yourfriend',
  repoUrl: 'https://github.com/ruslanmv/3D-Avatar-Chatbot',
  liveDemoUrl: 'https://www.yourfriend.online/',
  deployUrl: 'https://vercel.com/new/clone?repository-url=https://github.com/ruslanmv/3D-Avatar-Chatbot',
  appUrl: import.meta.env.VITE_APP_URL || 'https://www.yourfriend.online/',
};

export const navItems = [
  { label: 'Project', href: '#product' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Core', href: '#core' },
];

export const experiences: Experience[] = [
  {
    id: 'watch', icon: 'watch', title: 'Together Mode',
    body: 'Watch, listen, focus, journey, coach, or simply share a quiet scene with a behavior-aware 3D companion.',
  },
  {
    id: 'screen', icon: 'screen', title: 'Companion Mode',
    body: 'Pop the live avatar into a floating, resizable companion window and keep voice or text conversation beside your work.',
  },
  {
    id: 'gaming', icon: 'game', title: 'Voice + Multi-AI',
    body: 'Connect OpenAI, Claude, Watsonx, Ollama, or OllaBridge with speech-to-text, text-to-speech, lip sync, and expressions.',
  },
  {
    id: 'home', icon: 'home', title: 'VR + AR Presence',
    body: 'Step into WebXR VR or place the avatar in your room with AR hit testing, passthrough grounding, gaze, and spatial presence.',
  },
];
