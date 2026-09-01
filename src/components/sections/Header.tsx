import { useEffect, useRef, useState } from 'react';
import { navItems, site } from '../../config/site';
import type { ThemePreference } from '../../types';
import { Icon } from '../ui/Icon';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
];

export function Header({ preference, onTheme, onDemo }: { preference: ThemePreference; onTheme: (v: ThemePreference) => void; onDemo: () => void }) {
  const [menu, setMenu] = useState(false);
  const [themes, setThemes] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!themeRef.current?.contains(event.target as Node)) setThemes(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setThemes(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <header className="site-header">
    <a className="brand" href="#top" aria-label={`${site.name} home`}><span className="brand__mark"/><strong>YourFriend</strong></a>
    <nav className="nav nav--desktop" aria-label="Primary">{navItems.map(item => <a key={item.label} href={item.href}>{item.label}</a>)}</nav>
    <div className="header-actions">
      <div className="theme-menu" ref={themeRef}>
        <button className="theme-button" onClick={() => setThemes(value => !value)} aria-haspopup="menu" aria-expanded={themes} aria-label={`Theme: ${preference}`}><Icon name={preference === 'light' ? 'sun' : preference === 'dark' ? 'moon' : 'system'}/></button>
        {themes && <div className="theme-popover" role="menu" aria-label="Color theme">{themeOptions.map(option => <button key={option.value} role="menuitemradio" aria-checked={preference === option.value} onClick={() => { onTheme(option.value); setThemes(false); }}><span>{option.label}</span>{preference === option.value && <span aria-hidden="true">✓</span>}</button>)}</div>}
      </div>
      <a className="login-link" href={site.appUrl} target="_blank" rel="noopener noreferrer">Launch App</a>
      <button className="header-demo" onClick={onDemo}>Request Demo <span aria-hidden="true">→</span></button>
      <button className="menu-button" onClick={() => setMenu(v => !v)} aria-expanded={menu} aria-label={menu ? 'Close menu' : 'Open menu'}><Icon name={menu ? 'close' : 'menu'}/></button>
    </div>
    {menu && <nav className="nav nav--mobile" aria-label="Mobile navigation">{navItems.map(item => <a key={item.label} href={item.href} onClick={() => setMenu(false)}>{item.label}</a>)}</nav>}
  </header>;
}
