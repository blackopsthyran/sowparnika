import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import NProgress from 'nprogress';
import Head from 'next/head';
import { AuthProvider } from '@/contexts/AuthContext';
import theme from '@/lib/theme';
import Preloader from '@/components/Preloader/Preloader';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure NProgress to match old money theme
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 100,
      minimum: 0.08,
      easing: 'ease',
      speed: 400,
    });

    Router.events.on('routeChangeStart', () => {
      NProgress.start();
    });

    Router.events.on('routeChangeComplete', () => {
      NProgress.done(false);
    });

    Router.events.on('routeChangeError', () => {
      NProgress.done(false);
    });
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
        {!isLoading && <Component {...pageProps} />}
      </AuthProvider>
    </ChakraProvider>
  );
}
