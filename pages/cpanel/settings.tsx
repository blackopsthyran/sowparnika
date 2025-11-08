import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Divider,
  Switch,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

const SettingsPage = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [settings, setSettings] = useState({
    siteName: 'Sowparnika Properties',
    siteDescription: 'Find your dream home',
    emailNotifications: true,
    autoApproveListings: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSave = () => {
    // TODO: Save settings to database
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been saved successfully',
      status: 'success',
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <DefaultLayout title="Loading..." description="Loading">
        <Box p={8} textAlign="center">Loading...</Box>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DefaultLayout title="Settings" description="Website settings">
      <Box bg="white" minH="100vh" py={12}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="stretch">
            <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <Box>
                <Heading 
                  size="xl" 
                  mb={3} 
                  color="gray.900"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                >
                  Settings
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Configure your website settings
                </Text>
              </Box>
              <Link href="/">
                <Button
                  leftIcon={<FiHome />}
                  variant="outline"
                  borderColor="gray.900"
                  color="gray.900"
                  borderRadius="0"
                  _hover={{
                    bg: 'gray.900',
                    color: 'white',
                  }}
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                >
                  Go to Home
                </Button>
              </Link>
            </Flex>

            <Box
              border="2px solid"
              borderColor="gray.900"
              borderRadius="0"
              bg="white"
              p={8}
            >
              <Heading 
                size="md" 
                mb={6}
                color="gray.900"
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                General Settings
              </Heading>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                    Site Name
                  </FormLabel>
                  <Input
                    value={settings.siteName}
                    onChange={(e) =>
                      setSettings({ ...settings, siteName: e.target.value })
                    }
                    bg="white"
                    borderColor="gray.300"
                    color="gray.900"
                    borderRadius="0"
                    _focus={{
                      borderColor: 'gray.900',
                      boxShadow: '0 0 0 1px gray.900',
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                    Site Description
                  </FormLabel>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({ ...settings, siteDescription: e.target.value })
                    }
                    bg="white"
                    borderColor="gray.300"
                    color="gray.900"
                    borderRadius="0"
                    _focus={{
                      borderColor: 'gray.900',
                      boxShadow: '0 0 0 1px gray.900',
                    }}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Box
              border="2px solid"
              borderColor="gray.900"
              borderRadius="0"
              bg="white"
              p={8}
            >
              <Heading 
                size="md" 
                mb={6}
                color="gray.900"
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                Notification Settings
              </Heading>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="700" color="gray.900" mb={1}>Email Notifications</Text>
                    <Text fontSize="sm" color="gray.900">
                      Receive email notifications for new listings
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    colorScheme="gray"
                  />
                </HStack>
                <Box borderTop="1px solid" borderColor="gray.200" pt={6}>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="700" color="gray.900" mb={1}>Auto-approve Listings</Text>
                      <Text fontSize="sm" color="gray.900">
                        Automatically approve new listings without review
                      </Text>
                    </Box>
                    <Switch
                      isChecked={settings.autoApproveListings}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoApproveListings: e.target.checked,
                        })
                      }
                      colorScheme="gray"
                    />
                  </HStack>
                </Box>
              </VStack>
            </Box>

            <Box
              border="2px solid"
              borderColor="gray.900"
              borderRadius="0"
              bg="white"
              p={8}
            >
              <Heading 
                size="md" 
                mb={6}
                color="gray.900"
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                Account
              </Heading>
              <VStack spacing={4} align="stretch">
                <Button 
                  variant="outline" 
                  onClick={logout}
                  borderColor="gray.900"
                  color="gray.900"
                  borderRadius="0"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  _hover={{
                    bg: 'red.600',
                    color: 'white',
                    borderColor: 'red.600',
                  }}
                >
                  Logout
                </Button>
              </VStack>
            </Box>

            <HStack spacing={4}>
              <Button 
                bg="gray.900"
                color="white"
                borderRadius="0"
                onClick={handleSave}
                fontWeight="600"
                letterSpacing="0.1em"
                textTransform="uppercase"
                _hover={{
                  bg: 'gray.800',
                }}
              >
                Save Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/cpanel')}
                borderColor="gray.900"
                color="gray.900"
                borderRadius="0"
                fontWeight="600"
                letterSpacing="0.1em"
                textTransform="uppercase"
                _hover={{
                  bg: 'gray.900',
                  color: 'white',
                }}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default SettingsPage;

