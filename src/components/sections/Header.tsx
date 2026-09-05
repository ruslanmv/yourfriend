import { useState } from 'react';
import { navItems, site } from '../../config/site';
import type { ThemePreference } from '../../types';
import { Icon } from '../ui/Icon';

export function Header({ preference, onTheme, onDemo }: { preference: ThemePreference; onTheme: (v: ThemePreference) => void; onDemo: () => void }) {
  const [menu, setMenu] = useState(false);
  return <header className="site-header">
    <a className="brand" href="#top" aria-label={`${site.name} home`}><span className="brand__mark"/><strong>YourFriend</strong></a>
    <nav className="nav nav--desktop" aria-label="Primary">{navItems.map(item => <a key={item.label} href={item.href}>{item.label}</a>)}</nav>
    <div className="header-actions">
      <label className="theme-picker"><span className="sr-only">Color theme</span><Icon name={preference === 'light' ? 'sun' : preference === 'dark' ? 'moon' : 'system'}/><select value={preference} onChange={(event) => onTheme(event.target.value as ThemePreference)} aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <a className="login-link" href={site.appUrl} target="_blank" rel="noopener noreferrer">Open app</a>
      <button className="header-demo" onClick={onDemo}>Request Demo <span aria-hidden="true">→</span></button>
      <button className="menu-button" onClick={() => setMenu(v => !v)} aria-expanded={menu} aria-label={menu ? 'Close menu' : 'Open menu'}><Icon name={menu ? 'close' : 'menu'}/></button>
    </div>
    {menu && <nav className="nav nav--mobile" aria-label="Mobile navigation">{navItems.map(item => <a key={item.label} href={item.href} onClick={() => setMenu(false)}>{item.label}</a>)}</nav>}
  </header>;
}
