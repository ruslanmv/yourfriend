import type { Theme, ThemePreference } from '../types';
import { Header } from '../components/sections/Header';
import { Hero } from '../components/sections/Hero';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { PresenceSection } from '../components/sections/PresenceSection';
import { PrivacySection } from '../components/sections/PrivacySection';
import { MotionSection } from '../components/sections/MotionSection';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Footer } from '../components/sections/Footer';

export function HomePage({ theme, preference, setPreference }: { theme: Theme; preference: ThemePreference; setPreference: (v: ThemePreference) => void }) {
  return <><div id="top"/><Header preference={preference} onTheme={setPreference}/><main><Hero theme={theme}/><ExperienceSection/><PresenceSection/><PrivacySection/><MotionSection/><FinalCTA/></main><Footer/></>;
}
