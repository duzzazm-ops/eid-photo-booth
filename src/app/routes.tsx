import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageToggle } from './components/LanguageToggle';

const Home = lazy(() => import('./screens/Home').then((m) => ({ default: m.Home })));
const ModeSelection = lazy(() => import('./screens/ModeSelection').then((m) => ({ default: m.ModeSelection })));
const FrameSelection = lazy(() => import('./screens/FrameSelection').then((m) => ({ default: m.FrameSelection })));
const Camera = lazy(() => import('./screens/Camera').then((m) => ({ default: m.Camera })));
const Preview = lazy(() => import('./screens/Preview').then((m) => ({ default: m.Preview })));

function RouteFallback() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FAFAF7] text-[#1A1A1A] px-6">
      <div
        className="h-11 w-11 rounded-full border-2 border-[#C1A67B] border-t-transparent animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <p className="mt-4 text-sm text-[#666] font-['Inter'] text-center">Loading…</p>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function RootLayout() {
  return (
    <LanguageProvider>
      <LanguageToggle />
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </LanguageProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'mode',
        Component: ModeSelection,
      },
      {
        path: 'frames',
        Component: FrameSelection,
      },
      {
        path: 'camera',
        Component: Camera,
      },
      {
        path: 'preview',
        Component: Preview,
      },
      {
        path: '*',
        Component: Home,
      },
    ],
  },
]);
