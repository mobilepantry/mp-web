import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>MobilePantry | Supplier Portal</title>
        <meta name="description" content="Manage your surplus produce alerts and track rescues with MobilePantry." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
