import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from '../../lib/ErrorBoundary';
import ScrollToTop from '../../components/navigation/ScrollToTop';
import ScrollProgress from '../../components/navigation/ScrollProgress';
import CookieConsent from '../../components/feedback/CookieConsent';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <ScrollProgress />
        {children}
      </BrowserRouter>
      <Toaster
        toastOptions={{
          style: { padding: '15px' },
          className: 'my-toast',
        }}
        position="top-center"
        richColors
      />
      <CookieConsent />
    </ErrorBoundary>
  );
}
