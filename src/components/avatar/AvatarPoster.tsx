import { avatarConfig } from '../../config/avatar';
import type { Theme } from '../../types';

export function AvatarPoster({ theme, hidden }: { theme: Theme; hidden: boolean }) {
  return <picture className={`avatar-poster${hidden ? ' is-hidden' : ''}`} aria-hidden="true">
    <img
      src={avatarConfig.posters[theme]}
      alt=""
      width="800"
      height="1100"
      decoding="async"
      fetchPriority="high"
    />
  </picture>;
}
