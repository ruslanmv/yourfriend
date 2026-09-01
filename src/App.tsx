import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';

export default function App() {
  const { theme, preference, setPreference } = useTheme();
  return <BrowserRouter basename={import.meta.env.BASE_URL}><Routes><Route path="/" element={<HomePage theme={theme} preference={preference} setPreference={setPreference}/>}/><Route path="/privacy-policy" element={<LegalPage title="Privacy Policy"/>}/><Route path="/terms" element={<LegalPage title="Terms of Use"/>}/><Route path="*" element={<LegalPage title="Page not found"/>}/></Routes></BrowserRouter>;
}
