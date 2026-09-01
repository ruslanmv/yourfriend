import { useState } from 'react';
import type { Theme, ThemePreference } from '../types';
import { Header } from '../components/sections/Header';
import { Hero } from '../components/sections/Hero';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { PresenceSection } from '../components/sections/PresenceSection';
import { PrivacySection } from '../components/sections/PrivacySection';
import { MotionSection } from '../components/sections/MotionSection';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Footer } from '../components/sections/Footer';
import { DemoModal } from '../components/modals/DemoModal';
import { PreviewModal } from '../components/modals/PreviewModal';

export function HomePage({ theme, preference, setPreference }: { theme: Theme; preference: ThemePreference; setPreference: (v: ThemePreference) => void }) {
  const [demo, setDemo] = useState(false);
  const [preview, setPreview] = useState(false);
  return <><div id="top"/><Header preference={preference} onTheme={setPreference} onDemo={() => setDemo(true)}/><main><Hero theme={theme} onDemo={() => setDemo(true)} onPreview={() => setPreview(true)}/><ExperienceSection/><PresenceSection/><PrivacySection/><MotionSection/><FinalCTA onDemo={() => setDemo(true)} onPreview={() => setPreview(true)}/></main><Footer/><DemoModal open={demo} onClose={() => setDemo(false)}/><PreviewModal open={preview} onClose={() => setPreview(false)}/></>;
}
