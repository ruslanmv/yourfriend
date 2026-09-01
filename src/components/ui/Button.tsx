import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

export function Button({ children, variant = 'primary', icon, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; icon?: 'play' | 'arrow' }) {
  return <button className={`button button--${variant} ${className}`} {...props}>{icon === 'play' && <Icon name="play"/>}<span>{children}</span>{icon === 'arrow' && <Icon name="arrow"/>}</button>;
}
