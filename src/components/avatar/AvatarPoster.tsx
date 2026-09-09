import { avatarConfig } from '../../config/avatar';
import type { Theme } from '../../types';

export function AvatarPoster({ theme, hidden }: { theme: Theme; hidden: boolean }) {
  return <picture className={`avatar-poster${hidden ? ' is-hidden' : ''}`} aria-hidden="true">
    <img
      src={avatarConfig.posters[theme]}
      alt=""
      width="900"
      height="1200"
      decoding="async"
      fetchPriority="high"
      onError={(event) => {
        const image = event.currentTarget;
        if (image.dataset.fallbackApplied === 'true') return;
        image.dataset.fallbackApplied = 'true';
        image.src = avatarConfig.fallbackPosters[theme];
      }}
    />
  </picture>;
}
