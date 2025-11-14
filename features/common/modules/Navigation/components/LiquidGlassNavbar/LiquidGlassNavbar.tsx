import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  HStack, 
  VStack, 
  IconButton, 
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { 
  FiUser, 
  FiCamera, 
  FiHome, 
  FiMapPin,
  FiHeart,
  FiSearch,
  FiLogOut
} from 'react-icons/fi';
import { navigationLinks, propertyTypes } from '@/features/common/modules/Navigation/NavigationConsts';
import { useAuth } from '@/contexts/AuthContext';

const LiquidGlassNavbar = () => {
  const { isAuthenticated, isLoading, user, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [showPropertyTypesBar, setShowPropertyTypesBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position to change navbar color after hero section and hide property types bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      // Hero section is 75vh, so check if scrolled past that
      const heroHeight = window.innerHeight * 0.75;
      const scrollPosition = window.scrollY || window.pageYOffset;
      setIsScrolledPastHero(scrollPosition > heroHeight);

      // Hide/show property types bar on mobile when scrolling
      if (window.innerWidth < 768) { // Only on mobile
        if (scrollPosition > lastScrollY && scrollPosition > 100) {
          // Scrolling down and past 100px - hide the bar
          setShowPropertyTypesBar(false);
        } else if (scrollPosition < lastScrollY || scrollPosition <= 100) {
          // Scrolling up or near top - show the bar
          setShowPropertyTypesBar(true);
        }
        setLastScrollY(scrollPosition);
      } else {
        // Always show on desktop
        setShowPropertyTypesBar(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}&status=active`);
      setSearchQuery('');
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      width="100%"
    >
      <VStack spacing={0} align="stretch">
        {/* Main Navigation Bar */}
        <Box
          width="100%"
          sx={{
            backdropFilter: 'blur(12px) saturate(150%)',
            backgroundColor: isScrolledPastHero 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(255, 255, 255, 0.08)',
            borderBottom: isScrolledPastHero 
              ? '1px solid rgba(0, 0, 0, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          <Box
            paddingY="0.75rem"
            paddingX={{ base: '1.5rem', md: '2.5rem', lg: '3rem' }}
            position="relative"
          >
          <Flex alignItems="center" gap={4} w="100%">
            {/* Left Side: Hamburger Menu (Mobile) / Hamburger + Logo (Desktop) */}
            <HStack 
              gap={{ base: '0', md: '4', lg: '8' }} 
              alignItems="center" 
              flexShrink={0}
              w={{ base: '40px', md: 'auto' }}
            >
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color={isScrolledPastHero ? 'gray.900' : 'white'}
                fontSize="xl"
                onClick={onOpen}
                _hover={{ bg: isScrolledPastHero ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)' }}
                transition="color 0.3s ease"
              />
              <Box display={{ base: 'none', md: 'block' }}>
                <Link href="/">
                  <Flex alignItems="center" gap={3}>
                    <Box
                      as="img"
                      src="/logesh.png"
                      alt="Sowparnika Properties"
                      height={{ base: '40px', md: '55px', lg: '60px' }}
                      width="auto"
                      objectFit="contain"
                      loading="eager"
                      sx={{
                        filter: isScrolledPastHero ? 'none' : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
                      }}
                      _hover={{ opacity: 0.9 }}
                      transition="opacity 0.3s ease"
                    />
                    <Text
                      fontSize={{ base: '1rem', md: '1rem', lg: '1.2rem' }}
                      fontWeight="700"
                      color={isScrolledPastHero ? 'gray.900' : 'white'}
                      fontFamily="'Playfair Display', serif"
                      letterSpacing={{ base: '0.03em', md: '0.04em', lg: '0.05em' }}
                      lineHeight="1.1"
                      textTransform="uppercase"
                      whiteSpace="nowrap"
                      sx={{
                        textShadow: isScrolledPastHero ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                        fontFeatureSettings: '"liga" 1, "kern" 1',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        transform: 'scaleY(1.2)',
                        display: 'inline-block',
                      }}
                      _hover={{ opacity: 0.9 }}
                      cursor="pointer"
                      transition="color 0.3s ease"
                      as="span"
                    >
                      <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>S</Box>OWPARNIKA <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>P</Box>ROPERTIES
                    </Text>
                  </Flex>
                </Link>
              </Box>
            </HStack>

            {/* Center: Logo (Mobile) / Search Bar (Desktop) - Auto-adjusts width */}
            <Box 
              flex={{ base: 0, xl: 1 }}
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              minW={0}
              mx={{ base: 'auto', xl: 4 }}
            >
              {/* Mobile: Logo - Only show on mobile, hide when left logo appears (md+) */}
              <Box 
                display={{ base: 'block', md: 'none' }}
                whiteSpace="nowrap"
                overflow="visible"
              >
                <Link href="/">
                  <Text
                    fontSize={{ base: '0.85rem', sm: '0.95rem', md: '1rem' }}
                    fontWeight="700"
                    color={isScrolledPastHero ? 'gray.900' : 'white'}
                    fontFamily="'Playfair Display', serif"
                    letterSpacing={{ base: '0.02em', sm: '0.03em', md: '0.05em' }}
                    lineHeight="1.1"
                    textTransform="uppercase"
                    textAlign="center"
                    whiteSpace="nowrap"
                    sx={{
                      textShadow: isScrolledPastHero ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                      fontFeatureSettings: '"liga" 1, "kern" 1',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      transform: 'scaleY(1.2)',
                      display: 'inline-block',
                    }}
                    _hover={{ opacity: 0.9 }}
                    cursor="pointer"
                    transition="color 0.3s ease"
                    as="span"
                  >
                    <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>S</Box>OWPARNIKA <Box as="span" sx={{ fontSize: '1.25em', display: 'inline-block' }}>P</Box>ROPERTIES
                  </Text>
                </Link>
              </Box>
              {/* Desktop: Search Bar - Auto-adjusts width, hides on small screens */}
              <Box 
                display={{ base: 'none', xl: 'block' }} 
                width="100%"
                maxW="700px"
                minW="300px"
                mx="auto"
              >
                <form onSubmit={handleSearch}>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.500" size={18} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search Properties"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg="white"
                      borderColor="gray.200"
                      color="gray.800"
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{
                        borderColor: 'gray.300',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px blue.500',
                      }}
                      fontFamily="'Playfair Display', serif"
                      fontSize="sm"
                      borderRadius="full"
                      pl={10}
                    />
                  </InputGroup>
                </form>
              </Box>
            </Box>

            {/* Right Side: Spacer (Mobile) / Desktop Navigation (Desktop) */}
            <Box 
              w={{ base: '40px', md: 'auto' }}
              display="flex"
              justifyContent="flex-end"
            >
              <HStack
                gap={{ base: '4', md: '4', lg: '6', xl: '8' }}
                alignItems="center"
                fontWeight="medium"
                color={isScrolledPastHero ? 'gray.900' : 'white'}
                display={{ base: 'none', md: 'flex' }}
                flexShrink={0}
                flexWrap="wrap"
                sx={{
                  textShadow: isScrolledPastHero ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
                transition="color 0.3s ease"
              >
                {navigationLinks
                  .filter((item) => !item.requiresAuth || (mounted && isAuthenticated))
                  .map((item) => (
                  <Link key={item.title} href={item.link}>
                    <Text
                      _hover={{ 
                        color: isScrolledPastHero ? 'luxury.700' : 'luxury.200',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s"
                      cursor="pointer"
                      fontWeight="600"
                      fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                      fontFamily="'Playfair Display', serif"
                      color={isScrolledPastHero ? 'gray.900' : 'white'}
                      position="relative"
                      whiteSpace="nowrap"
                      _after={{
                        content: '""',
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        width: '0%',
                        height: '2px',
                        bg: isScrolledPastHero ? 'luxury.700' : 'luxury.200',
                        transition: 'width 0.3s',
                      }}
                      sx={{
                        '&:hover::after': {
                          width: '100%',
                        },
                      }}
                    >
                      {item.title}
                    </Text>
                  </Link>
                ))}
                {mounted && !isLoading && isAuthenticated && user && (
                  <Text
                    fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                    fontFamily="'Playfair Display', serif"
                    fontWeight="600"
                    color={isScrolledPastHero ? 'gray.900' : 'white'}
                    whiteSpace="nowrap"
                    display={{ base: 'none', lg: 'block' }}
                    sx={{
                      textShadow: isScrolledPastHero ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    Welcome, {user.username}
                  </Text>
                )}
                {mounted && !isLoading && !isAuthenticated && (
                  <Link href="/login">
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      px={{ base: 4, md: 5, lg: 6 }}
                      fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      color={isScrolledPastHero ? 'luxury.700' : 'white'}
                      borderColor={isScrolledPastHero ? 'luxury.700' : 'white'}
                      whiteSpace="nowrap"
                      _hover={{
                        bg: isScrolledPastHero ? 'luxury.50' : 'rgba(255, 255, 255, 0.2)',
                        borderColor: isScrolledPastHero ? 'luxury.800' : 'white',
                        color: isScrolledPastHero ? 'luxury.800' : 'white',
                        transform: 'scale(1.05)',
                      }}
                      transition="all 0.3s ease"
                    >
                      LOGIN
                    </Button>
                  </Link>
                )}
              </HStack>
            </Box>
          </Flex>
          </Box>
        </Box>

        {/* Property Types Navigation Bar - Single horizontal row */}
        <Box
          width="100%"
          className={!showPropertyTypesBar ? 'property-types-bar-hidden' : ''}
          sx={{
            backdropFilter: 'blur(12px) saturate(150%)',
            backgroundColor: isScrolledPastHero 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(255, 255, 255, 0.08)',
            borderBottom: isScrolledPastHero 
              ? '1px solid rgba(0, 0, 0, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            '@media (max-width: 767px)': {
              transition: 'opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease',
              '&.property-types-bar-hidden': {
                opacity: 0,
                transform: 'translateY(-100%)',
                maxHeight: 0,
                overflow: 'hidden',
                marginBottom: 0,
              },
            },
          }}
        >
          <Box
            paddingY={{ base: '0.4rem', md: '0.75rem' }}
            paddingX={{ base: '1rem', md: '2rem', lg: '3rem' }}
          >
            <Flex alignItems="center" justifyContent="space-between" gap={4}>
              <Box
                overflowX="auto"
                flex={1}
                sx={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <HStack
                  gap={{ base: 4, md: 4, lg: 6 }}
                  justifyContent="flex-start"
                  minW="max-content"
                  color={isScrolledPastHero ? 'gray.900' : 'white'}
                  sx={{
                    textShadow: isScrolledPastHero ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                  transition="color 0.3s ease"
                >
                  {propertyTypes.map((item) => (
                    <Link key={item.title} href={item.link}>
                      <Text
                        _hover={{ 
                          color: isScrolledPastHero ? 'luxury.700' : 'luxury.200',
                          transform: 'translateY(-1px)',
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        fontWeight="500"
                        fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                        fontFamily="'Playfair Display', serif"
                        whiteSpace="nowrap"
                        color={isScrolledPastHero ? 'gray.900' : 'white'}
                        flexShrink={0}
                        position="relative"
                        _after={{
                          content: '""',
                          position: 'absolute',
                          bottom: '-2px',
                          left: 0,
                          width: '0%',
                          height: '2px',
                          bg: isScrolledPastHero ? 'luxury.700' : 'luxury.200',
                          transition: 'width 0.3s',
                        }}
                        sx={{
                          '&:hover::after': {
                            width: '100%',
                          },
                        }}
                      >
                        {item.title}
                      </Text>
                    </Link>
                  ))}
                </HStack>
              </Box>
              <HStack spacing={{ base: 2, md: 2, lg: 3 }} display={{ base: 'none', lg: 'flex' }}>
                <Link href="/submit-listing">
                  <Button
                    size="sm"
                    variant="accent"
                    borderRadius="full"
                    px={{ base: 4, md: 5, lg: 6 }}
                    fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                    fontFamily="'Playfair Display', serif"
                    fontWeight="600"
                    whiteSpace="nowrap"
                    _hover={{
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}
                    transition="all 0.3s ease"
                  >
                    Sell With Us
                  </Button>
                </Link>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </VStack>

      {/* Sidebar Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <VStack alignItems="center" spacing={2}>
              <Flex alignItems="center" gap={4} w="100%" justifyContent="center">
                <Box
                  as="img"
                  src="/logesh.png"
                  alt="Sowparnika Properties"
                  height={{ base: '80px', md: '100px' }}
                  width="auto"
                  objectFit="contain"
                  loading="eager"
                />
                <Text 
                  fontSize={{ base: 'lg', md: 'xl' }} 
                  fontWeight="700" 
                  fontFamily="'Playfair Display', serif"
                  display={{ base: 'none', md: 'block' }}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  SOWPARNIKA PROPERTIES
                </Text>
              </Flex>
              <Text fontSize="xl" fontWeight="600" fontFamily="'Playfair Display', serif">
                Menu
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0} height="100%" justifyContent="space-between">
              <Box flex="1">
                {/* Main Navigation Links */}
                <Box p={4} borderBottomWidth="1px">
                  <VStack align="stretch" spacing={3}>
                    {navigationLinks
                      .filter((item) => !item.requiresAuth || (mounted && isAuthenticated))
                      .map((item) => (
                      <Link key={item.title} href={item.link} onClick={onClose}>
                        <Text
                          fontSize="md"
                          fontWeight="600"
                          fontFamily="'Playfair Display', serif"
                          color="gray.900"
                          _hover={{ color: 'blue.600' }}
                          transition="color 0.2s"
                          cursor="pointer"
                        >
                          {item.title}
                        </Text>
                      </Link>
                    ))}
                  </VStack>
                </Box>

                {/* All Property Types */}
                <Box p={4}>
                  <VStack align="stretch" spacing={3}>
                    {propertyTypes.map((item) => (
                      <Link key={item.title} href={item.link} onClick={onClose}>
                        <Text
                          fontSize="md"
                          fontWeight="600"
                          fontFamily="'Playfair Display', serif"
                          color="gray.900"
                          _hover={{ color: 'blue.600' }}
                          transition="color 0.2s"
                          cursor="pointer"
                        >
                          {item.title}
                        </Text>
                      </Link>
                    ))}
                  </VStack>
                </Box>
              </Box>

              {/* All Buttons at the Bottom */}
              <Box borderTopWidth="1px" p={4}>
                <VStack align="stretch" spacing={3}>
                  {/* Welcome Message / Sign In Button */}
                  {mounted && !isLoading && isAuthenticated && user && (
                    <Box p={3} bg="gray.50" borderRadius="md" mb={2}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        fontFamily="'Playfair Display', serif"
                        color="gray.900"
                      >
                        Welcome, {user.username}
                      </Text>
                    </Box>
                  )}
                  {mounted && !isLoading && !isAuthenticated && (
                    <Link href="/login" onClick={onClose} style={{ width: '100%' }}>
                      <Button
                        leftIcon={<FiUser />}
                        size="lg"
                        width="100%"
                        borderRadius="0"
                        fontWeight="600"
                        fontFamily="'Playfair Display', serif"
                        bg="white"
                        color="gray.900"
                        border="1px solid"
                        borderColor="gray.900"
                        _hover={{ bg: 'gray.50' }}
                        transition="all 0.2s"
                      >
                        Sign in / Register
                      </Button>
                    </Link>
                  )}

                  {/* CPANEL Button - Only for Admin */}
                  {mounted && !isLoading && isAuthenticated && isAdmin && (
                    <Link href="/cpanel" onClick={onClose} style={{ width: '100%' }}>
                      <Button
                        size="lg"
                        bg="white"
                        color="gray.900"
                        border="1px solid"
                        borderColor="gray.900"
                        borderRadius="0"
                        width="100%"
                        fontWeight="600"
                        fontFamily="'Playfair Display', serif"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        _hover={{ bg: 'gray.50' }}
                        transition="all 0.2s"
                      >
                        CPANEL
                      </Button>
                    </Link>
                  )}
                  <Link href="/submit-listing" onClick={onClose} style={{ width: '100%' }}>
                    <Button
                      size="lg"
                      bg="white"
                      color="gray.900"
                      border="1px solid"
                      borderColor="gray.900"
                      borderRadius="0"
                      width="100%"
                      fontWeight="600"
                      fontFamily="'Playfair Display', serif"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                    >
                      Sell With Us
                    </Button>
                  </Link>

                  {/* Logout Button - Only show when authenticated */}
                  {mounted && !isLoading && isAuthenticated && (
                    <Button
                      leftIcon={<FiLogOut />}
                      size="lg"
                      width="100%"
                      borderRadius="0"
                      fontWeight="600"
                      fontFamily="'Playfair Display', serif"
                      bg="white"
                      color="gray.900"
                      border="1px solid"
                      borderColor="gray.900"
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                      onClick={() => {
                        onClose();
                        logout();
                      }}
                    >
                      Logout
                    </Button>
                  )}
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default LiquidGlassNavbar;

