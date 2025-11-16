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
import { FiSearch, FiEdit, FiTrash2, FiHome, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  image: string;
  testimonial: string;
  status: string;
  created_at: string;
}

const ManageTestimonialsPage = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?returnUrl=/cpanel/testimonials');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchTestimonials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  // Reset when search query changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      // Debounce search - wait 500ms after user stops typing
      const timeoutId = setTimeout(() => {
        fetchTestimonials();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-testimonials', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      let filteredTestimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
      
      // Client-side search filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredTestimonials = filteredTestimonials.filter(
          (t: Testimonial) =>
            t.name.toLowerCase().includes(query) ||
            t.company.toLowerCase().includes(query) ||
            t.testimonial.toLowerCase().includes(query)
        );
      }
      
      setTestimonials(filteredTestimonials);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to fetch testimonials. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch('/api/update-testimonial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          // Get current testimonial data to preserve other fields
          ...testimonials.find((t) => t.id === id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Testimonial ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
          status: 'success',
          duration: 3000,
        });
        fetchTestimonials();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update testimonial status',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update testimonial status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/delete-testimonial?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const data = await response.json();

      if (response.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        onClose();
        setTestimonialToDelete(null);
        
        toast({
          title: 'Success',
          description: 'Testimonial deleted successfully',
          status: 'success',
          duration: 3000,
        });
        
        fetchTestimonials();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete testimonial',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openDeleteModal = (id: string) => {
    setTestimonialToDelete(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (testimonialToDelete) {
      handleDelete(testimonialToDelete);
      setTestimonialToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
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
    <DefaultLayout title="Manage Testimonials" description="Manage testimonials">
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
                  Manage Testimonials
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Add, edit, update, or delete testimonials
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
                <Link href="/cpanel/create-testimonial">
                  <Button 
                    leftIcon={<FiPlus />}
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
                    Add New Testimonial
                  </Button>
                </Link>
              </HStack>
            </Flex>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search by name, company, or testimonial text..."
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
                  <Text color="gray.900">Loading testimonials...</Text>
                </Box>
              ) : testimonials.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.900">No testimonials found</Text>
                </Box>
              ) : (
                <Table variant="simple" minW={{ base: '800px', md: 'auto' }}>
                  <Thead bg="gray.100" borderBottom="2px solid" borderColor="gray.900">
                    <Tr>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Name</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Company</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Testimonial</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Status</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {testimonials.map((testimonial) => (
                      <Tr key={testimonial.id} borderBottom="1px solid" borderColor="gray.200" _hover={{ bg: 'gray.50' }}>
                        <Td fontWeight="600" color="gray.900" py={4}>{testimonial.name}</Td>
                        <Td color="gray.900" py={4}>{testimonial.company}</Td>
                        <Td color="gray.900" py={4} maxW="400px">
                          <Text noOfLines={2} fontSize="sm">
                            {testimonial.testimonial}
                          </Text>
                        </Td>
                        <Td py={4}>
                          <Switch
                            isChecked={testimonial.status === 'active'}
                            onChange={() => handleToggleStatus(testimonial.id, testimonial.status)}
                            colorScheme="green"
                            size="md"
                          />
                          <Badge 
                            ml={2}
                            borderRadius="0"
                            px={2}
                            py={1}
                            bg={getStatusColor(testimonial.status) === 'green' ? 'green.500' : 'gray.500'}
                            color="white"
                            fontWeight="600"
                            fontSize="xs"
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                          >
                            {testimonial.status}
                          </Badge>
                        </Td>
                        <Td py={4}>
                          <HStack spacing={2}>
                            <Link href={`/cpanel/create-testimonial?id=${testimonial.id}`}>
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
                              onClick={() => openDeleteModal(testimonial.id)}
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
            Delete Testimonial
          </ModalHeader>
          <ModalCloseButton color="gray.900" />
          <ModalBody>
            <Text color="gray.900" fontFamily="'Playfair Display', serif">
              Are you sure you want to delete this testimonial? This action cannot be undone.
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

export default ManageTestimonialsPage;

