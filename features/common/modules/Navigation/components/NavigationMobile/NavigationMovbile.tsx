import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { navigationLinks } from '@/features/common/modules/Navigation/NavigationConsts';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/AuthContext';

const NavigationMovbile = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      color="blue.600"
      padding="2rem"
      backgroundColor="white"
      display={{ base: 'block', md: 'none' }}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Link href="/">
          <Box display="flex" gap="2" alignItems="center">
            <Box
              as="img"
              src="/logo.png"
              alt="Sowparnika Properties"
              height="50px"
              width="auto"
              objectFit="contain"
              loading="eager"
            />
            <Text fontSize="lg" fontWeight="bold" color="blue.900" display={{ base: 'none', sm: 'block' }} fontFamily="'Playfair Display', serif">
              Sowparnika Properties
            </Text>
          </Box>
        </Link>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="outline"
          />
          <MenuList>
            {navigationLinks.map((item) => (
              <NavigationLinks
                key={item.title}
                link={item.link}
                title={item.title}
                icon={<item.icon />}
              />
            ))}
            {mounted && !isLoading && isAuthenticated && (
              <MenuItem as={Link} href="/cpanel">
                <Box
                  as="span"
                  display="block"
                  width="full"
                  textAlign="center"
                  color="blue.500"
                  fontWeight="medium"
                >
                  CPANEL
                </Box>
              </MenuItem>
            )}
            {mounted && !isLoading && !isAuthenticated && (
              <MenuItem as={Link} href="/login">
                <Box
                  as="span"
                  display="block"
                  width="full"
                  textAlign="center"
                  fontWeight="medium"
                >
                  LOGIN
                </Box>
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default NavigationMovbile;

const NavigationLinks = ({
  title,
  link,
  icon,
}: {
  title: string;
  link: string;
  icon?: JSX.Element;
}) => {
  return (
    <Link href={link}>
      <MenuItem alignItems="center" gap="0.5rem">
        {icon}
        {title}
      </MenuItem>
    </Link>
  );
};
