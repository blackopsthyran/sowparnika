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
} from '@chakra-ui/react';
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
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="xl" mb={2} color="blue.700">
                Settings
              </Heading>
              <Text color="gray.600">Configure your website settings</Text>
            </Box>

            <Card>
              <CardBody>
                <Heading size="md" mb={4}>General Settings</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Site Name</FormLabel>
                    <Input
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Site Description</FormLabel>
                    <Input
                      value={settings.siteDescription}
                      onChange={(e) =>
                        setSettings({ ...settings, siteDescription: e.target.value })
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Notification Settings</Heading>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Email Notifications</Text>
                      <Text fontSize="sm" color="gray.600">
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
                    />
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Auto-approve Listings</Text>
                      <Text fontSize="sm" color="gray.600">
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
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Account</Heading>
                <VStack spacing={4} align="stretch">
                  <Button colorScheme="red" variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={handleSave}>
                Save Settings
              </Button>
              <Button variant="ghost" onClick={() => router.push('/cpanel')}>
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

