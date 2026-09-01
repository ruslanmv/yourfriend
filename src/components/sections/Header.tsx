import { useState } from 'react';
import { navItems, site } from '../../config/site';
import type { ThemePreference } from '../../types';
import { Icon } from '../ui/Icon';

export function Header({ preference, onTheme, onDemo }: { preference: ThemePreference; onTheme: (v: ThemePreference) => void; onDemo: () => void }) {
  const [menu, setMenu] = useState(false);
  const nextTheme = preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system';
  return <header className="site-header">
    <a className="brand" href="#top" aria-label={`${site.name} home`}><span className="brand__mark"/><strong>YourFriend</strong></a>
    <nav className="nav nav--desktop" aria-label="Primary">{navItems.map(item => <a key={item.label} href={item.href}>{item.label}</a>)}</nav>
    <div className="header-actions">
      <button className="theme-button" onClick={() => onTheme(nextTheme)} aria-label={`Theme: ${preference}. Change theme`} title={`Theme: ${preference}`}><Icon name={preference === 'light' ? 'sun' : preference === 'dark' ? 'moon' : 'system'}/></button>
      <button className="header-demo" onClick={onDemo}>Request Demo</button>
      <a className="login-link" href={site.appUrl}>Log in</a>
      <button className="menu-button" onClick={() => setMenu(v => !v)} aria-expanded={menu} aria-label="Open menu"><Icon name={menu ? 'close' : 'menu'}/></button>
    </div>
    {menu && <nav className="nav nav--mobile" aria-label="Mobile navigation">{navItems.map(item => <a key={item.label} href={item.href} onClick={() => setMenu(false)}>{item.label}</a>)}</nav>}
  </header>;
}
