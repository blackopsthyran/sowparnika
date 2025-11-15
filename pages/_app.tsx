import type { AppProps } from 'next/app';
import { ChakraProvider, Box, Spinner, Text } from '@chakra-ui/react';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import NProgress from 'nprogress';
import Head from 'next/head';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import theme from '@/lib/theme';
import Preloader from '@/components/Preloader/Preloader';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingToProperty, setNavigatingToProperty] = useState(false);

  useEffect(() => {
    // Configure NProgress to match old money theme
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 100,
      minimum: 0.08,
      easing: 'ease',
      speed: 400,
    });

    const handleRouteChangeStart = (url: string) => {
      // Check if navigating to property details page (not already on it)
      const currentPath = Router.asPath?.split('?')[0]; // Remove query params
      const targetPath = url.split('?')[0]; // Remove query params
      
      if (targetPath.startsWith('/properties/') && targetPath !== currentPath && targetPath.match(/^\/properties\/[^/]+$/)) {
        setNavigatingToProperty(true);
        setIsNavigating(true);
      } else {
        setNavigatingToProperty(false);
        setIsNavigating(true);
      }
      NProgress.start();
    };

    const handleRouteChangeComplete = () => {
      NProgress.done(false);
      setIsNavigating(false);
      setNavigatingToProperty(false);
    };

    const handleRouteChangeError = () => {
      NProgress.done(false);
      setIsNavigating(false);
      setNavigatingToProperty(false);
    };

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <FavoritesProvider>
            {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
            {!isLoading && (
              <>
                {/* Property Details Loading Overlay - More Prominent */}
                {navigatingToProperty && (
                  <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(255, 255, 255, 0.95)"
                    zIndex={9999}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(4px)"
                  >
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="gray.900"
                      size="xl"
                      mb={4}
                    />
                    <Text
                      fontSize="lg"
                      color="gray.700"
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Loading Property Details...
                    </Text>
                  </Box>
                )}
                <Component {...pageProps} />
              </>
            )}
          </FavoritesProvider>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}
