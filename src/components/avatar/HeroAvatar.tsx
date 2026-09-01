import { AvatarCanvas } from './AvatarCanvas';
import { AvatarFallback } from './AvatarFallback';

export function HeroAvatar() {
  const live = import.meta.env.VITE_ENABLE_LIVE_VRM === 'true';
  return <div className="hero-avatar">{live ? <AvatarCanvas/> : <AvatarFallback/>}</div>;
}
