import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, Text, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { navigationLinks } from '@/features/common/modules/Navigation/NavigationConsts';
import { useAuth } from '@/contexts/AuthContext';

const LiquidGlassNavbar = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollPosition > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      width="100%"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      paddingX={isScrolled ? { base: '1rem', md: '2rem' } : 0}
      paddingTop={isScrolled ? { base: '0.5rem', md: '1rem' } : 0}
    >
      <Box
        maxWidth={isScrolled ? '1200px' : '100%'}
        margin="0 auto"
        borderRadius={isScrolled ? '2xl' : '0'}
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        sx={{
          backdropFilter: isScrolled 
            ? 'blur(24px) saturate(200%)' 
            : 'blur(12px) saturate(150%)',
          backgroundColor: isScrolled
            ? 'rgba(255, 255, 255, 0.75)'
            : 'rgba(255, 255, 255, 0.08)',
          border: isScrolled 
            ? '1px solid rgba(255, 255, 255, 0.4)' 
            : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isScrolled
            ? '0 12px 40px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
            : '0 4px 16px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          paddingY={isScrolled ? '1rem' : '1.5rem'}
          paddingX={{ base: '1.5rem', md: '3rem' }}
          transition="all 0.3s ease-in-out"
        >
        <Flex alignItems="center" justifyContent="space-between">
          <Link href="/">
            <Box
              display="flex"
              gap="2"
              alignItems="center"
              transition="all 0.3s"
            >
              <Box
                as="img"
                src="/logo.png"
                alt="Sowparnika Properties"
                height={isScrolled ? '55px' : '65px'}
                width="auto"
                objectFit="contain"
                transition="all 0.3s"
                loading="eager"
                sx={{
                  filter: isScrolled 
                    ? 'none' 
                    : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
                }}
              />
              <Text
                fontSize={isScrolled ? 'lg' : 'xl'}
                fontWeight="bold"
                color={isScrolled ? 'blue.900' : 'white'}
                transition="all 0.3s"
                display={{ base: 'none', md: 'block' }}
                fontFamily="'Playfair Display', serif"
                sx={{
                  textShadow: isScrolled 
                    ? 'none' 
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              >
                Sowparnika Properties
              </Text>
            </Box>
          </Link>
          {/* Desktop Navigation */}
          <HStack
            gap={{ base: '4', md: '8' }}
            alignItems="center"
            fontWeight="medium"
            color={isScrolled ? 'gray.800' : 'white'}
            transition="color 0.3s"
            display={{ base: 'none', md: 'flex' }}
            sx={{
              textShadow: isScrolled 
                ? 'none' 
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {navigationLinks.map((item) => (
              <Link key={item.title} href={item.link}>
                <Text
                  _hover={{ color: isScrolled ? 'blue.600' : 'blue.200' }}
                  transition="color 0.2s"
                  cursor="pointer"
                  fontWeight="600"
                  fontFamily="'Playfair Display', serif"
                >
                  {item.title}
                </Text>
              </Link>
            ))}
            {mounted && !isLoading && isAuthenticated && (
              <Link href="/cpanel">
                <Button
                  size="sm"
                  colorScheme="blue"
                  borderRadius="full"
                  px={6}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  CPANEL
                </Button>
              </Link>
            )}
            {mounted && !isLoading && !isAuthenticated && (
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  px={6}
                  color={isScrolled ? 'blue.600' : 'white'}
                  borderColor={isScrolled ? 'blue.600' : 'white'}
                  _hover={{
                    bg: isScrolled ? 'blue.50' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                  }}
                  transition="all 0.2s"
                >
                  LOGIN
                </Button>
              </Link>
            )}
          </HStack>

          {/* Mobile Navigation */}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              color={isScrolled ? 'gray.700' : 'white'}
              display={{ base: 'block', md: 'none' }}
            />
            <MenuList bg="white" color="gray.800">
              {navigationLinks.map((item) => (
                <MenuItem key={item.title} as={Link} href={item.link}>
                  {item.title}
                </MenuItem>
              ))}
              {mounted && !isLoading && isAuthenticated && (
                <MenuItem as={Link} href="/cpanel">
                  CPANEL
                </MenuItem>
              )}
              {mounted && !isLoading && !isAuthenticated && (
                <MenuItem as={Link} href="/login">
                  LOGIN
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default LiquidGlassNavbar;

