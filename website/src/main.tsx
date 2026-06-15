import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';

// Self-hosted Geist fonts (replaces next/font/google). These define the
// 'Geist Variable' / 'Geist Mono Variable' families referenced by the
// --font-geist-sans / --font-geist-mono CSS variables in globals.css.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';

export const createRoot = ViteReactSSG({ routes });
