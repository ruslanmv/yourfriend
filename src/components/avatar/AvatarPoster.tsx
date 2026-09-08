import { avatarConfig } from '../../config/avatar';
import type { Theme } from '../../types';

export function AvatarPoster({ theme, hidden }: { theme: Theme; hidden: boolean }) {
  return <picture className={`avatar-poster${hidden ? ' is-hidden' : ''}`} aria-hidden="true">
    <img
      src={avatarConfig.posters[theme]}
      alt=""
      width="824"
      height="1830"
      decoding="async"
      fetchPriority="high"
      onError={(event) => {
        const fallback = avatarConfig.fallbackPosters[theme];
        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
      }}
    />
  </picture>;
}
