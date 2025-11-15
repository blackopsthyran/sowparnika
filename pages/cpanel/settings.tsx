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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiHome, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import JSZip from 'jszip';

const SettingsPage = () => {
  const { isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [settings, setSettings] = useState({
    siteName: 'Sowparnika Properties',
    siteDescription: 'Find your dream home',
    emailNotifications: true,
    autoApproveListings: false,
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?returnUrl=/cpanel/settings');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);

  const handleSave = () => {
    // TODO: Save settings to database
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been saved successfully',
      status: 'success',
      duration: 3000,
    });
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    const toastId = toast({
      title: 'Creating Backup',
      description: 'Please wait while we prepare your backup...',
      status: 'info',
      duration: null,
      isClosable: false,
    });

    try {
      // Fetch backup data from API
      const response = await fetch('/api/download-backup');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create backup');
      }

      const backupData = await response.json();

      // Create ZIP file
      const zip = new JSZip();

      // Add database backup as JSON
      zip.file('database.json', JSON.stringify(backupData.database, null, 2));

      // Add metadata
      zip.file('metadata.json', JSON.stringify(backupData.metadata, null, 2));

      // Download images and add to ZIP
      const imagesFolder = zip.folder('images');
      let downloadedCount = 0;
      let failedCount = 0;

      toast.close(toastId);
      const progressToast = toast({
        title: 'Downloading Images',
        description: `Downloading ${backupData.images.length} images... (0/${backupData.images.length})`,
        status: 'info',
        duration: null,
        isClosable: false,
      });

      // Download images in batches to avoid overwhelming the server
      const batchSize = 10;
      for (let i = 0; i < backupData.images.length; i += batchSize) {
        const batch = backupData.images.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (image: any) => {
            try {
              const imageResponse = await fetch(image.url);
              if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                if (imagesFolder) {
                  imagesFolder.file(image.name, blob);
                  downloadedCount++;
                  
                  // Update progress
                  if (downloadedCount % 5 === 0 || downloadedCount === backupData.images.length) {
                    toast.close(progressToast);
                    toast({
                      title: 'Downloading Images',
                      description: `Downloading... (${downloadedCount}/${backupData.images.length})`,
                      status: 'info',
                      duration: null,
                      isClosable: false,
                    });
                  }
                }
              } else {
                failedCount++;
                console.error(`Failed to download image: ${image.name}`);
              }
            } catch (error) {
              failedCount++;
              console.error(`Error downloading image ${image.name}:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < backupData.images.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast.closeAll();

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP file
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `backup-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Backup Downloaded',
        description: `Backup created successfully! ${downloadedCount} images downloaded${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Backup error:', error);
      toast.closeAll();
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to create backup. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout title="Loading..." description="Loading">
        <Box p={8} textAlign="center">Loading...</Box>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
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
                Backup & Export
              </Heading>
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="0">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm" fontWeight="600">Database & Images Backup</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Download a complete backup of your database and all property images as a ZIP file.
                      This may take a few minutes if you have many images.
                    </AlertDescription>
                  </Box>
                </Alert>
                <Button 
                  leftIcon={<FiDownload />}
                  bg="gray.900"
                  color="white"
                  borderRadius="0"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  onClick={handleDownloadBackup}
                  isLoading={isDownloadingBackup}
                  loadingText="Creating Backup..."
                  _hover={{
                    bg: 'gray.800',
                  }}
                >
                  Download Backup (Database + Images)
                </Button>
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

