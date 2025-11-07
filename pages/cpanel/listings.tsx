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
} from '@chakra-ui/react';
import { FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

interface Property {
  id: string;
  title: string;
  property_type: string;
  price: number;
  city: string;
  status: string;
  images: string[];
  created_at: string;
}

const ManageListingsPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-properties?limit=100');
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/delete-property?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Property deleted successfully',
          status: 'success',
          duration: 3000,
        });
        fetchProperties();
        onClose();
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DefaultLayout title="Manage Listings" description="Manage property listings">
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="xl" mb={2} color="blue.700">
                  Manage Listings
                </Heading>
                <Text color="gray.600">Edit, update, or delete property listings</Text>
              </Box>
              <Link href="/cpanel/create-listing">
                <Button colorScheme="blue">Create New Listing</Button>
              </Link>
            </Flex>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
              />
            </InputGroup>

            <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
              {loading ? (
                <Box p={8} textAlign="center">
                  <Text>Loading properties...</Text>
                </Box>
              ) : filteredProperties.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.500">No properties found</Text>
                </Box>
              ) : (
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Image</Th>
                      <Th>Title</Th>
                      <Th>Type</Th>
                      <Th>Price</Th>
                      <Th>City</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProperties.map((property) => (
                      <Tr key={property.id}>
                        <Td>
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                              fallbackSrc="https://placehold.co/50x50/e2e8f0/64748b?text=No+Image"
                            />
                          ) : (
                            <Box
                              boxSize="50px"
                              bg="gray.200"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="xs" color="gray.500">No Image</Text>
                            </Box>
                          )}
                        </Td>
                        <Td fontWeight="medium">{property.title}</Td>
                        <Td>{property.property_type || 'N/A'}</Td>
                        <Td>
                          {property.price
                            ? `$${property.price.toLocaleString()}`
                            : 'N/A'}
                        </Td>
                        <Td>{property.city || 'N/A'}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(property.status)}>
                            {property.status || 'active'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Link href={`/properties/${property.id}`}>
                              <IconButton
                                aria-label="View"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                              />
                            </Link>
                            <Link href={`/cpanel/edit-listing?id=${property.id}`}>
                              <IconButton
                                aria-label="Edit"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                              />
                            </Link>
                            <IconButton
                              aria-label="Delete"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Property</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this property? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default ManageListingsPage;

