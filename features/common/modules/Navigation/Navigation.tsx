import React from 'react';
import { useRouter } from 'next/router';
import NavigationDesktop from '@/features/common/modules/Navigation/components/NavigationDesktop';
import NavigationMobile from '@/features/common/modules/Navigation/components/NavigationMobile';
import LiquidGlassNavbar from '@/features/common/modules/Navigation/components/LiquidGlassNavbar/LiquidGlassNavbar';

const Navigation = () => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  if (isHomePage) {
    return <LiquidGlassNavbar />;
  }

  return (
    <>
      <NavigationDesktop />
      <NavigationMobile />
    </>
  );
};

export default Navigation;
