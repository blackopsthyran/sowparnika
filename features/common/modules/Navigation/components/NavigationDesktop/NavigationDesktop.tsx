import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { navigationLinks } from '@/features/common/modules/Navigation/NavigationConsts';
import { useAuth } from '@/contexts/AuthContext';

const NavigationDesktop = () => {
  const { isAuthenticated, isLoading, user, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      color="blue.600"
      paddingY="2rem"
      paddingX={{ base: '2rem', md: '2.5rem', lg: '3rem' }}
      backgroundColor="white"
      display={{ base: 'none', md: 'block' }}
    >
      <Box maxWidth="1280px" margin="0 auto">
        <Flex alignItems="center" justifyContent="space-between">
          <Link href="/">
            <Box display="flex" gap="2" alignItems="center">
              <Box
                as="img"
                src="/logesh.png"
                alt="Sowparnika Properties"
                height="60px"
                width="auto"
                objectFit="contain"
                loading="eager"
              />
              <Text fontSize="xl" fontWeight="bold" color="blue.900" display={{ base: 'none', lg: 'block' }} fontFamily="'Playfair Display', serif" as="span">
                <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>S</Box>owparnika <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>P</Box>roperties
              </Text>
            </Box>
          </Link>
          <Flex gap={{ base: '6', md: '8', lg: '12' }} alignItems='center' fontWeight='medium' flexWrap="wrap">
            {navigationLinks
              .filter((item) => !item.requiresAuth || (mounted && isAuthenticated))
              .map((item) => (
              <NavigationLinks
                key={item.title}
                link={item.link}
                title={item.title}
                icon={<item.icon />}
              />
            ))}
            {mounted && !isLoading && isAuthenticated && user && (
              <>
                <Text fontSize="sm" fontWeight="600" color="blue.900">
                  Welcome, {user.username}
                </Text>
                <Button
                  padding="1.5rem"
                  colorScheme="gray"
                  fontSize="0.8rem"
                  fontWeight="medium"
                  variant="outline"
                  onClick={logout}
                >
                  LOGOUT
                </Button>
              </>
            )}
            {mounted && !isLoading && !isAuthenticated && (
              <Link href="/login">
                <Button
                  padding="1.5rem"
                  colorScheme="gray"
                  fontSize="0.8rem"
                  fontWeight="medium"
                  variant="outline"
                >
                  LOGIN
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default NavigationDesktop;

const NavigationLinks = ({
  title,
  link,
  icon,
}: {
  title: string;
  link: string;
  icon: JSX.Element;
}) => {
  return (
    <Link href={link} passHref legacyBehavior>
      {/* @ts-ignore - Chakra UI Flex type complexity with Next.js Link */}
      <Flex as="a" align="center" gap="0.5rem" cursor="pointer" fontFamily="'Playfair Display', serif">
        {icon}
        {title}
      </Flex>
    </Link>
  );
};
