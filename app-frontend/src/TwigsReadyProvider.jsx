import { useLayoutEffect, useMemo, useState } from 'react';
import {
  ThemeContext,
  defaultTheme,
  createTheme,
  globalStyles,
  theme as twigsTheme,
} from '@sparrowengg/twigs-react';

const mergedThemeStatic = { ...defaultTheme, ...twigsTheme };

let injectedThemeClass = null;

/**
 * Inject Stitches theme class + globalStyles once. Host shells often run the app
 * before useLayoutEffect; calling here at module load + idempotent re-call helps.
 * We do NOT remove the class on unmount — doing so strips Twigs from the page
 * under React StrictMode double-mount and breaks styling.
 */
export function ensureTwigsStylesInjected() {
  if (typeof document === 'undefined') {
    return null;
  }
  if (injectedThemeClass) {
    return injectedThemeClass;
  }
  const cls = createTheme(mergedThemeStatic);
  document.documentElement.classList.add(cls);
  globalStyles();
  injectedThemeClass = cls;
  return cls;
}

// Run as early as possible when the bundle executes in the browser
ensureTwigsStylesInjected();

/**
 * Twigs' ThemeProvider uses useEffect for globalStyles (late). We inject early
 * above and sync ThemeContext with the same class in useLayoutEffect.
 */
export function TwigsReadyProvider({ children }) {
  const mergedTheme = useMemo(() => mergedThemeStatic, []);

  const [themeClass, setThemeClass] = useState(() =>
    typeof document !== 'undefined' ? ensureTwigsStylesInjected() : null,
  );

  useLayoutEffect(() => {
    const cls = ensureTwigsStylesInjected();
    setThemeClass(cls);
  }, [mergedTheme]);

  return (
    <ThemeContext.Provider value={themeClass}>{children}</ThemeContext.Provider>
  );
}
