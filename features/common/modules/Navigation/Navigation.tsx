import React from 'react';
import { useRouter } from 'next/router';
import LiquidGlassNavbar from '@/features/common/modules/Navigation/components/LiquidGlassNavbar/LiquidGlassNavbar';
import StandardNavbar from '@/features/common/modules/Navigation/components/StandardNavbar';

const Navigation = () => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  // Use LiquidGlassNavbar for home page, StandardNavbar for all other pages
  if (isHomePage) {
    return <LiquidGlassNavbar />;
  }

  return <StandardNavbar />;
};

export default Navigation;
