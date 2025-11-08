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
import { 
  FaChartBar,
  FaPlus,
  FaEdit,
  FaCog,
  FaInbox
} from 'react-icons/fa';
import { navigationLinks, propertyTypes } from '@/features/common/modules/Navigation/NavigationConsts';
import { useAuth } from '@/contexts/AuthContext';

const StandardNavbar = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPropertyTypesBar, setShowPropertyTypesBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position for subtle styling changes and hide property types bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollPosition > 50);

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
    handleScroll();

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

  // Check if user is on a cpanel page
  const isCpanelPage = router.pathname.startsWith('/cpanel');

  // Cpanel menu items
  const cpanelMenuItems = [
    { title: 'Dashboard', link: '/cpanel', icon: FaChartBar },
    { title: 'Create Listing', link: '/cpanel/create-listing', icon: FaPlus },
    { title: 'Manage Listings', link: '/cpanel/listings', icon: FaEdit },
    { title: 'Property Requests', link: '/cpanel/property-requests', icon: FaInbox },
    { title: 'Settings', link: '/cpanel/settings', icon: FaCog },
  ];

  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      width="100%"
      bg="white"
      boxShadow={isScrolled ? 'sm' : 'none'}
      transition="box-shadow 0.3s ease"
    >
      <VStack spacing={0} align="stretch">
        {/* Main Navigation Bar */}
        <Box
          width="100%"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Box
            paddingY="1rem"
            paddingX={{ base: '1.5rem', md: '3rem' }}
            position="relative"
          >
            <Flex alignItems="center" justifyContent="space-between" gap={4}>
              {/* Left Side: Hamburger Menu (Mobile) / Hamburger + Logo (Desktop) */}
              <HStack 
                gap={{ base: '0', md: '8' }} 
                alignItems="center" 
                flexShrink={0}
                w={{ base: '40px', md: 'auto' }}
              >
                <IconButton
                  aria-label="Open menu"
                  icon={<HamburgerIcon />}
                  variant="ghost"
                  color="gray.900"
                  fontSize="xl"
                  onClick={onOpen}
                  _hover={{ bg: 'gray.100' }}
                  transition="all 0.2s"
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Link href="/">
                    <Text
                      fontSize={{ base: '1rem', md: '1.2rem' }}
                      fontWeight="700"
                      color="gray.900"
                      fontFamily="'Playfair Display', serif"
                      letterSpacing="0.05em"
                      lineHeight="1.1"
                      textTransform="uppercase"
                      sx={{
                        fontFeatureSettings: '"liga" 1, "kern" 1',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        transform: 'scaleY(1.2)',
                        display: 'inline-block',
                      }}
                      _hover={{ opacity: 0.8 }}
                      cursor="pointer"
                      transition="opacity 0.2s"
                    >
                      Sowparnika Properties
                    </Text>
                  </Link>
                </Box>
              </HStack>

              {/* Center: Logo (Mobile) / Search Bar (Desktop) */}
              <Box 
                flex={1} 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
                position={{ base: 'absolute', md: 'static' }}
                left="50%"
                transform={{ base: 'translateX(-50%)', md: 'none' }}
                maxW={{ base: 'calc(100% - 80px)', md: '400px', lg: '500px' }}
                width={{ base: 'auto', md: 'auto' }}
              >
                {/* Mobile: Logo */}
                <Box 
                  display={{ base: 'block', md: 'none' }}
                  whiteSpace="nowrap"
                  overflow="visible"
                >
                  <Link href="/">
                    <Text
                      fontSize={{ base: '0.85rem', sm: '0.95rem', md: '1rem' }}
                      fontWeight="700"
                      color="gray.900"
                      fontFamily="'Playfair Display', serif"
                      letterSpacing={{ base: '0.02em', sm: '0.03em', md: '0.05em' }}
                      lineHeight="1.1"
                      textTransform="uppercase"
                      textAlign="center"
                      whiteSpace="nowrap"
                      sx={{
                        fontFeatureSettings: '"liga" 1, "kern" 1',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        transform: 'scaleY(1.2)',
                        display: 'inline-block',
                      }}
                      _hover={{ opacity: 0.8 }}
                      cursor="pointer"
                      transition="opacity 0.2s"
                    >
                      Sowparnika Properties
                    </Text>
                  </Link>
                </Box>
                {/* Desktop: Search Bar */}
                <Box display={{ base: 'none', md: 'block' }} width="100%">
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
                          borderColor: 'gray.900',
                          boxShadow: '0 0 0 1px gray.900',
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
                  gap={{ base: '4', md: '8' }}
                  alignItems="center"
                  fontWeight="medium"
                  color="gray.900"
                  display={{ base: 'none', md: 'flex' }}
                  flexShrink={0}
                >
                  {navigationLinks.map((item) => (
                    <Link key={item.title} href={item.link}>
                      <Text
                        _hover={{ color: 'blue.600' }}
                        transition="color 0.2s"
                        cursor="pointer"
                        fontWeight="600"
                        fontSize="sm"
                        fontFamily="'Playfair Display', serif"
                        color="gray.900"
                      >
                        {item.title}
                      </Text>
                    </Link>
                  ))}
                  {mounted && !isLoading && !isAuthenticated && (
                    <Link href="/login">
                      <Button
                        size="sm"
                        variant="outline"
                        borderRadius="full"
                        px={6}
                        fontSize="sm"
                        fontFamily="'Playfair Display', serif"
                        fontWeight="600"
                        color="gray.900"
                        borderColor="gray.900"
                        _hover={{
                          bg: 'gray.900',
                          color: 'white',
                        }}
                        transition="all 0.2s"
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

        {/* Cpanel Navigation Bar - Desktop */}
        {isCpanelPage && mounted && !isLoading && isAuthenticated && (
          <Box
            width="100%"
            bg="white"
            borderBottom="2px solid"
            borderColor="gray.900"
            display={{ base: 'none', md: 'block' }}
          >
            <Box
              paddingY="0.75rem"
              paddingX={{ base: '1.5rem', md: '3rem' }}
            >
              <HStack
                gap="8"
                justifyContent="flex-start"
                flexWrap="wrap"
                color="gray.900"
              >
                {cpanelMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.link || 
                    (router.pathname === '/cpanel/edit-listing' && item.link === '/cpanel/listings');
                  return (
                    <Link key={item.link} href={item.link}>
                      <HStack
                        gap={2}
                        _hover={{ opacity: 0.7 }}
                        transition="opacity 0.2s"
                        cursor="pointer"
                        borderBottom={isActive ? '2px solid' : '2px solid transparent'}
                        borderBottomColor={isActive ? 'gray.900' : 'transparent'}
                        pb={1}
                      >
                        <Icon size={16} color="gray.900" />
                        <Text
                          fontWeight={isActive ? '700' : '500'}
                          fontSize="sm"
                          fontFamily="'Playfair Display', serif"
                          whiteSpace="nowrap"
                          color="gray.900"
                          letterSpacing="0.05em"
                          textTransform="uppercase"
                        >
                          {item.title}
                        </Text>
                      </HStack>
                    </Link>
                  );
                })}
              </HStack>
            </Box>
          </Box>
        )}

        {/* Property Types Navigation Bar - Hide when on cpanel pages */}
        {!isCpanelPage && (
          <Box
            width="100%"
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.200"
            className={!showPropertyTypesBar ? 'property-types-bar-hidden' : ''}
            sx={{
              transition: 'opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease',
              '@media (max-width: 767px)': {
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
              paddingX={{ base: '1rem', md: '3rem' }}
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
                    gap={{ base: 4, md: 6 }}
                    justifyContent="flex-start"
                    minW="max-content"
                    color="gray.900"
                  >
                    {propertyTypes.map((item) => (
                      <Link key={item.title} href={item.link}>
                        <Text
                          _hover={{ color: 'blue.600' }}
                          transition="color 0.2s"
                          cursor="pointer"
                          fontWeight="500"
                          fontSize={{ base: 'xs', md: 'sm' }}
                          fontFamily="'Playfair Display', serif"
                          whiteSpace="nowrap"
                          color="gray.900"
                          flexShrink={0}
                        >
                          {item.title}
                        </Text>
                      </Link>
                    ))}
                  </HStack>
                </Box>
                <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
                  {mounted && !isLoading && isAuthenticated && (
                    <Link href="/cpanel">
                      <Button
                        size="sm"
                        bg="gray.900"
                        color="white"
                        borderRadius="0"
                        px={6}
                        fontSize="sm"
                        fontFamily="'Playfair Display', serif"
                        fontWeight="600"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        _hover={{ bg: 'gray.800' }}
                        transition="all 0.2s"
                        whiteSpace="nowrap"
                      >
                        CPANEL
                      </Button>
                    </Link>
                  )}
                  <Link href="/submit-listing">
                    <Button
                      size="sm"
                      bg="gray.900"
                      color="white"
                      borderRadius="0"
                      px={6}
                      fontSize="sm"
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      _hover={{ bg: 'gray.800' }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      Sell With Us
                    </Button>
                  </Link>
                </HStack>
              </Flex>
            </Box>
          </Box>
        )}
      </VStack>

      {/* Sidebar Drawer - Same as LiquidGlassNavbar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <Text fontSize="xl" fontWeight="600" fontFamily="'Playfair Display', serif">
              Menu
            </Text>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0} height="100%" justifyContent="space-between">
              <Box flex="1">
                {/* Main Navigation Links */}
                <Box p={4} borderBottomWidth="1px">
                  <VStack align="stretch" spacing={3}>
                    {navigationLinks.map((item) => (
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
                  {/* Sign In / Register Button */}
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

                  {/* CPANEL and Sell With Us Buttons */}
                  {mounted && !isLoading && isAuthenticated && (
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

      {/* Floating Cpanel Navigation Bar - Mobile */}
      {isCpanelPage && mounted && !isLoading && isAuthenticated && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTop="2px solid"
          borderColor="gray.900"
          display={{ base: 'block', md: 'none' }}
          zIndex={999}
          boxShadow="0 -4px 6px rgba(0, 0, 0, 0.1)"
        >
          <Box
            paddingY="0.75rem"
            paddingX="0.5rem"
            overflowX="auto"
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <HStack
              gap={{ base: 4, sm: 6 }}
              justifyContent="flex-start"
              minW="max-content"
              color="gray.900"
            >
              {cpanelMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.link || 
                  (router.pathname === '/cpanel/edit-listing' && item.link === '/cpanel/listings');
                return (
                  <Link key={item.link} href={item.link}>
                    <VStack
                      gap={1}
                      minW="60px"
                      _active={{ opacity: 0.7 }}
                      transition="opacity 0.2s"
                      cursor="pointer"
                      px={2}
                      py={1}
                      borderTop={isActive ? '2px solid' : '2px solid transparent'}
                      borderTopColor={isActive ? 'gray.900' : 'transparent'}
                    >
                      <Icon size={20} color="gray.900" />
                      <Text
                        fontWeight={isActive ? '700' : '500'}
                        fontSize="xs"
                        fontFamily="'Playfair Display', serif"
                        whiteSpace="nowrap"
                        color="gray.900"
                        letterSpacing="0.05em"
                        textTransform="uppercase"
                        textAlign="center"
                      >
                        {item.title}
                      </Text>
                    </VStack>
                  </Link>
                );
              })}
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StandardNavbar;

