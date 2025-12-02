import { useEffect, useState } from 'react';

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    let timeoutId = null;

    const updateMedia = () => {
      if (window.innerWidth > 1000) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(updateMedia, 150);
    };

    updateMedia();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { isDesktop };
};
