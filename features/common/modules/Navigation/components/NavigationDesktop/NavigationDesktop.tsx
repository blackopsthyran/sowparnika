import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { navigationLinks } from '@/features/common/modules/Navigation/NavigationConsts';
import { useAuth } from '@/contexts/AuthContext';

const NavigationDesktop = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      color="blue.600"
      paddingY="2rem"
      paddingX="3rem"
      backgroundColor="white"
      display={{ base: 'none', md: 'block' }}
    >
      <Box maxWidth="1280px" margin="0 auto">
        <Flex alignItems="center" justifyContent="space-between">
          <Link href="/">
            <Box display="flex" gap="2" alignItems="center">
              <Box
                as="img"
                src="/logo.png"
                alt="Sowparnika Properties"
                height="60px"
                width="auto"
                objectFit="contain"
                loading="eager"
              />
              <Text fontSize="xl" fontWeight="bold" color="blue.900" display={{ base: 'none', lg: 'block' }} fontFamily="'Playfair Display', serif">
                Sowparnika Properties
              </Text>
            </Box>
          </Link>
          <Flex gap='12' alignItems='center' fontWeight='medium'>
            {navigationLinks.map((item) => (
              <NavigationLinks
                key={item.title}
                link={item.link}
                title={item.title}
                icon={<item.icon />}
              />
            ))}
            {mounted && !isLoading && isAuthenticated && (
              <Link href="/cpanel">
                <Button
                  padding="1.5rem"
                  colorScheme="twitter"
                  fontSize="0.8rem"
                  fontWeight="medium"
                >
                  CPANEL
                </Button>
              </Link>
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
