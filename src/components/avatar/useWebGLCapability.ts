import { useEffect, useState } from 'react';

export function useWebGLCapability() {
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    if (navigator.userAgent.includes('jsdom')) return;
    try {
      const canvas = document.createElement('canvas');
      setCapable(Boolean(canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true })));
    } catch {
      setCapable(false);
    }
  }, []);
  return capable;
}
