import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  VStack,
  Text,
  Flex,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  link: string;
  icon: React.ElementType;
}

const CpanelNavigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      link: '/cpanel',
      icon: FaChartBar,
    },
    {
      title: 'Create Listing',
      link: '/cpanel/create-listing',
      icon: FaPlus,
    },
    {
      title: 'Manage Listings',
      link: '/cpanel/listings',
      icon: FaEdit,
    },
    {
      title: 'Settings',
      link: '/cpanel/settings',
      icon: FaCog,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <IconButton
        aria-label="Open menu"
        icon={<HamburgerIcon />}
        variant="ghost"
        color="gray.900"
        fontSize="xl"
        onClick={onOpen}
        _hover={{ bg: 'gray.100' }}
        transition="all 0.2s"
        position="fixed"
        top="1rem"
        left="1rem"
        zIndex={1001}
        bg="white"
        border="2px solid"
        borderColor="gray.900"
        borderRadius="0"
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent borderRadius="0" borderRight="2px solid" borderColor="gray.900">
          <DrawerHeader
            borderBottom="2px solid"
            borderColor="gray.900"
            pb={4}
          >
            <Flex align="center" justify="space-between">
              <Text
                fontSize="xl"
                fontWeight="700"
                color="gray.900"
                fontFamily="'Playfair Display', serif"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                Control Panel
              </Text>
              <DrawerCloseButton color="gray.900" />
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              {/* Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                // Check if current route matches the nav item link
                // For edit-listing, it should highlight "Manage Listings" instead
                const isActive = router.pathname === item.link || 
                  (router.pathname === '/cpanel/edit-listing' && item.link === '/cpanel/listings');
                return (
                  <Link key={item.link} href={item.link} onClick={onClose}>
                    <Box
                      p={4}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      bg={isActive ? 'gray.50' : 'white'}
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      borderLeft={isActive ? '4px solid' : '4px solid transparent'}
                      borderLeftColor={isActive ? 'gray.900' : 'transparent'}
                    >
                      <Flex alignItems="center" gap={4}>
                        <Icon
                          size={20}
                          color={isActive ? 'gray.900' : 'gray.600'}
                        />
                        <Text
                          fontSize="md"
                          fontFamily="'Playfair Display', serif"
                          fontWeight={isActive ? '700' : '500'}
                          color="gray.900"
                          letterSpacing="0.05em"
                          textTransform="uppercase"
                        >
                          {item.title}
                        </Text>
                      </Flex>
                    </Box>
                  </Link>
                );
              })}

              <Divider borderColor="gray.200" />

              {/* Back to Home */}
              <Link href="/" onClick={onClose}>
                <Box
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Flex alignItems="center" gap={4}>
                    <FaHome size={20} color="gray.600" />
                    <Text
                      fontSize="md"
                      fontFamily="'Playfair Display', serif"
                      fontWeight="500"
                      color="gray.900"
                      letterSpacing="0.05em"
                      textTransform="uppercase"
                    >
                      Back to Home
                    </Text>
                  </Flex>
                </Box>
              </Link>

              {/* Logout */}
              <Box
                p={4}
                borderTop="2px solid"
                borderColor="gray.200"
                mt="auto"
              >
                <Box
                  p={4}
                  bg="gray.900"
                  borderRadius="0"
                  cursor="pointer"
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  _hover={{ bg: 'gray.800' }}
                  transition="all 0.2s"
                >
                  <Flex alignItems="center" gap={4} justifyContent="center">
                    <FaSignOutAlt size={20} color="white" />
                    <Text
                      fontSize="md"
                      fontFamily="'Playfair Display', serif"
                      fontWeight="700"
                      color="white"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                    >
                      Logout
                    </Text>
                  </Flex>
                </Box>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CpanelNavigation;

