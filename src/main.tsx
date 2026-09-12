import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/components.css';
import './styles/ambient-effects.css';
import './styles/audio.css';
import './styles/responsive.css';
import './styles/interactions.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
