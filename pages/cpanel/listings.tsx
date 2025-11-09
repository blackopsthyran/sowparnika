import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Heading,
  Text,
  Badge,
  IconButton,
  useToast,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Image,
  Switch,
} from '@chakra-ui/react';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiHome } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

interface Property {
  id: string;
  title: string;
  property_type: string;
  price: number;
  city: string;
  status: string;
  featured?: boolean;
  images: string[];
  created_at: string;
}

const ManageListingsPage = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?returnUrl=/cpanel/listings');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Add cache: 'no-store' to prevent stale data
      const response = await fetch('/api/get-properties?limit=100', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (response.ok) {
        setProperties(data.properties || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch properties',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch('/api/update-property', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          featured: !currentFeatured,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Property ${!currentFeatured ? 'marked as' : 'removed from'} featured`,
          status: 'success',
          duration: 3000,
        });
        fetchProperties();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update featured status',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/delete-property?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store', // Prevent caching
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistically remove from UI immediately
        setProperties((prev) => prev.filter((p) => p.id !== id));
        onClose();
        setPropertyToDelete(null);
        
        toast({
          title: 'Success',
          description: 'Property deleted successfully',
          status: 'success',
          duration: 3000,
        });
        
        // Refetch to ensure data is in sync
        fetchProperties();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete property',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openDeleteModal = (id: string) => {
    setPropertyToDelete(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      handleDelete(propertyToDelete);
      setPropertyToDelete(null);
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'sold':
        return 'blue';
      case 'rented':
        return 'purple';
      default:
        return 'gray';
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
    <DefaultLayout title="Manage Listings" description="Manage property listings">
      <Box bg="white" minH="100vh" py={12} pb={{ base: 24, md: 12 }}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
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
                  Manage Listings
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Edit, update, or delete property listings
                </Text>
              </Box>
              <HStack spacing={3} flexWrap="wrap">
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
                <Link href="/cpanel/create-listing">
                  <Button 
                    bg="gray.900"
                    color="white"
                    borderRadius="0"
                    fontWeight="600"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    _hover={{
                      bg: 'gray.800',
                    }}
                  >
                    Create New Listing
                  </Button>
                </Link>
              </HStack>
            </Flex>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                borderColor="gray.300"
                color="gray.900"
                borderRadius="0"
                _placeholder={{ color: 'gray.400' }}
                _focus={{
                  borderColor: 'gray.900',
                  boxShadow: '0 0 0 1px gray.900',
                }}
              />
            </InputGroup>

            <Box 
              border="2px solid" 
              borderColor="gray.900" 
              borderRadius="0" 
              bg="white" 
              overflowX="auto"
              overflowY="visible"
              sx={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  bg: 'gray.100',
                },
                '&::-webkit-scrollbar-thumb': {
                  bg: 'gray.400',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  bg: 'gray.500',
                },
              }}
            >
              {loading ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.900">Loading properties...</Text>
                </Box>
              ) : filteredProperties.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.900">No properties found</Text>
                </Box>
              ) : (
                <Table variant="simple" minW={{ base: '800px', md: 'auto' }}>
                  <Thead bg="gray.100" borderBottom="2px solid" borderColor="gray.900">
                    <Tr>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Image</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Title</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Type</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Price</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">City</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Status</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Featured</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProperties.map((property) => (
                      <Tr key={property.id} borderBottom="1px solid" borderColor="gray.200" _hover={{ bg: 'gray.50' }}>
                        <Td py={4}>
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="0"
                              fallbackSrc="https://placehold.co/50x50/e2e8f0/64748b?text=No+Image"
                            />
                          ) : (
                            <Box
                              boxSize="50px"
                              bg="gray.200"
                              borderRadius="0"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              border="1px solid"
                              borderColor="gray.300"
                            >
                              <Text fontSize="xs" color="gray.900">No Image</Text>
                            </Box>
                          )}
                        </Td>
                        <Td fontWeight="600" color="gray.900" py={4}>{property.title}</Td>
                        <Td color="gray.900" py={4}>{property.property_type || 'N/A'}</Td>
                        <Td color="gray.900" fontWeight="600" py={4}>
                          {property.price
                            ? `₹ ${property.price.toLocaleString('en-IN')}`
                            : 'N/A'}
                        </Td>
                        <Td color="gray.900" py={4}>{property.city || 'N/A'}</Td>
                        <Td py={4}>
                          <Badge 
                            borderRadius="0"
                            px={2}
                            py={1}
                            bg="gray.900"
                            color="white"
                            fontWeight="600"
                            fontSize="xs"
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                          >
                            {property.status || 'active'}
                          </Badge>
                        </Td>
                        <Td py={4}>
                          <Switch
                            isChecked={property.featured || false}
                            onChange={() => handleToggleFeatured(property.id, property.featured || false)}
                            colorScheme="warm"
                            size="md"
                          />
                        </Td>
                        <Td py={4}>
                          <HStack spacing={2}>
                            <Link href={`/properties/${property.id}`}>
                              <IconButton
                                aria-label="View"
                                icon={<FiEye />}
                                size="sm"
                                variant="outline"
                                borderColor="gray.900"
                                color="gray.900"
                                borderRadius="0"
                                _hover={{
                                  bg: 'gray.900',
                                  color: 'white',
                                }}
                              />
                            </Link>
                            <Link href={`/cpanel/edit-listing?id=${property.id}`}>
                              <IconButton
                                aria-label="Edit"
                                icon={<FiEdit />}
                                size="sm"
                                variant="outline"
                                borderColor="gray.900"
                                color="gray.900"
                                borderRadius="0"
                                _hover={{
                                  bg: 'gray.900',
                                  color: 'white',
                                }}
                              />
                            </Link>
                            <IconButton
                              aria-label="Delete"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="outline"
                              borderColor="gray.900"
                              color="gray.900"
                              borderRadius="0"
                              _hover={{
                                bg: 'red.600',
                                color: 'white',
                                borderColor: 'red.600',
                              }}
                              onClick={() => openDeleteModal(property.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="0" border="2px solid" borderColor="gray.900">
          <ModalHeader 
            fontFamily="'Playfair Display', serif" 
            fontWeight="700"
            color="gray.900"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            Delete Property
          </ModalHeader>
          <ModalCloseButton color="gray.900" />
          <ModalBody>
            <Text color="gray.900" fontFamily="'Playfair Display', serif">
              Are you sure you want to delete this property? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onClose}
              borderColor="gray.900"
              color="gray.900"
              borderRadius="0"
              _hover={{
                bg: 'gray.900',
                color: 'white',
              }}
            >
              Cancel
            </Button>
            <Button 
              bg="gray.900"
              color="white"
              borderRadius="0"
              onClick={confirmDelete}
              _hover={{
                bg: 'red.600',
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default ManageListingsPage;

