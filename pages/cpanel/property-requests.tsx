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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
} from '@chakra-ui/react';
import { FiSearch, FiCheck, FiX, FiEye, FiHome } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

interface Property {
  id: string;
  title: string;
  property_type: string;
  price: number;
  city: string;
  status: string;
  request_status: string;
  user_email: string;
  owner_name: string;
  owner_number: string;
  images: string[];
  created_at: string;
}

const PropertyRequestsPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [propertyToUpdate, setPropertyToUpdate] = useState<{ id: string; status: string } | null>(null);
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedStatus]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Fetch property requests from the new property_requests table
      const statusFilter = selectedStatus === 'all' ? '' : selectedStatus;
      const url = statusFilter 
        ? `/api/get-property-requests?status=${statusFilter}&limit=100`
        : '/api/get-property-requests?limit=100';
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        // Map property_requests to match the Property interface
        const mappedProperties = (data.requests || []).map((req: any) => ({
          id: req.id,
          title: req.title,
          property_type: req.property_type,
          price: req.price,
          city: req.city,
          status: req.request_status, // Use request_status as status for display
          request_status: req.request_status,
          user_email: req.user_email,
          owner_name: req.owner_name,
          owner_number: req.owner_number,
          images: req.images || [],
          created_at: req.created_at,
        }));
        setProperties(mappedProperties);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch property requests',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching property requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch property requests',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, requestStatus: 'approved' | 'rejected', propertyStatus: string = 'active') => {
    try {
      const response = await fetch('/api/update-request-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          request_status: requestStatus,
          status: propertyStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const message = requestStatus === 'approved' 
          ? 'Property request approved and moved to properties table'
          : 'Property request rejected and deleted';
        toast({
          title: 'Success',
          description: message,
          status: 'success',
          duration: 3000,
        });
        // Refresh the list
        fetchProperties();
        onApproveClose();
        onRejectClose();
        setPropertyToUpdate(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || data.message || `Failed to ${requestStatus} property request`,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: `Failed to ${requestStatus} property request`,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openApproveModal = (id: string, currentStatus: string) => {
    setPropertyToUpdate({ id, status: currentStatus });
    onApproveOpen();
  };

  const openRejectModal = (id: string, currentStatus: string) => {
    setPropertyToUpdate({ id, status: currentStatus });
    onRejectOpen();
  };

  const confirmApprove = () => {
    if (propertyToUpdate) {
      handleUpdateStatus(propertyToUpdate.id, 'approved', 'active');
    }
  };

  const confirmReject = () => {
    if (propertyToUpdate) {
      handleUpdateStatus(propertyToUpdate.id, 'rejected');
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (property.user_email && property.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (property.owner_name && property.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
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
    <DefaultLayout title="Property Requests" description="Manage property listing requests">
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
                  Property Requests
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Review and manage property listing requests from users
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

            <Tabs 
              index={selectedStatus === 'pending' ? 0 : selectedStatus === 'approved' ? 1 : selectedStatus === 'rejected' ? 2 : 3}
              onChange={(index) => {
                const statuses: ('pending' | 'approved' | 'rejected' | 'all')[] = ['pending', 'approved', 'rejected', 'all'];
                setSelectedStatus(statuses[index]);
              }}
              colorScheme="gray"
            >
              <TabList borderBottom="2px solid" borderColor="gray.900">
                <Tab 
                  color="gray.900" 
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  _selected={{ color: 'gray.900', borderBottom: '2px solid', borderColor: 'gray.900' }}
                >
                  Pending
                </Tab>
                <Tab 
                  color="gray.900" 
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  _selected={{ color: 'gray.900', borderBottom: '2px solid', borderColor: 'gray.900' }}
                >
                  Approved
                </Tab>
                <Tab 
                  color="gray.900" 
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  _selected={{ color: 'gray.900', borderBottom: '2px solid', borderColor: 'gray.900' }}
                >
                  Rejected
                </Tab>
                <Tab 
                  color="gray.900" 
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  _selected={{ color: 'gray.900', borderBottom: '2px solid', borderColor: 'gray.900' }}
                >
                  All
                </Tab>
              </TabList>
            </Tabs>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search by title, city, email, or owner name..."
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
                  <Text color="gray.900">Loading property requests...</Text>
                </Box>
              ) : filteredProperties.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color="gray.900">No property requests found</Text>
                </Box>
              ) : (
                <Table variant="simple" minW={{ base: '900px', md: 'auto' }}>
                  <Thead bg="gray.100" borderBottom="2px solid" borderColor="gray.900">
                    <Tr>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Image</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Title</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Type</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Price</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">User Email</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Submitted</Th>
                      <Th color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" fontSize="xs" py={4} whiteSpace="nowrap">Status</Th>
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
                        <Td color="gray.900" py={4} fontSize="sm">{property.user_email || 'N/A'}</Td>
                        <Td color="gray.900" py={4} fontSize="sm">
                          {property.created_at
                            ? new Date(property.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </Td>
                        <Td py={4}>
                          <Badge
                            borderRadius="0"
                            px={2}
                            py={1}
                            bg={`${getRequestStatusColor(property.request_status || 'pending')}.500`}
                            color="white"
                            fontWeight="600"
                            fontSize="xs"
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                          >
                            {property.request_status || 'pending'}
                          </Badge>
                        </Td>
                        <Td py={4}>
                          <HStack spacing={2}>
                            {/* View button - only show for approved requests that are in properties table */}
                            {property.request_status === 'approved' && (
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
                            )}
                            {/* Only show approve/reject buttons for pending requests */}
                            {property.request_status === 'pending' && (
                              <>
                                <IconButton
                                  aria-label="Approve"
                                  icon={<FiCheck />}
                                  size="sm"
                                  variant="outline"
                                  borderColor="green.600"
                                  color="green.600"
                                  borderRadius="0"
                                  _hover={{
                                    bg: 'green.600',
                                    color: 'white',
                                  }}
                                  onClick={() => openApproveModal(property.id, 'active')}
                                />
                                <IconButton
                                  aria-label="Reject"
                                  icon={<FiX />}
                                  size="sm"
                                  variant="outline"
                                  borderColor="red.600"
                                  color="red.600"
                                  borderRadius="0"
                                  _hover={{
                                    bg: 'red.600',
                                    color: 'white',
                                  }}
                                  onClick={() => openRejectModal(property.id, property.status)}
                                />
                              </>
                            )}
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

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="0" border="2px solid" borderColor="gray.900">
          <ModalHeader
            fontFamily="'Playfair Display', serif"
            fontWeight="700"
            color="gray.900"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            Approve Property Request
          </ModalHeader>
          <ModalCloseButton color="gray.900" />
          <ModalBody>
            <Text color="gray.900" fontFamily="'Playfair Display', serif">
              Are you sure you want to approve this property listing? It will be published and visible on the website.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onApproveClose}
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
              bg="green.600"
              color="white"
              borderRadius="0"
              onClick={confirmApprove}
              _hover={{
                bg: 'green.700',
              }}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="0" border="2px solid" borderColor="gray.900">
          <ModalHeader
            fontFamily="'Playfair Display', serif"
            fontWeight="700"
            color="gray.900"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            Reject Property Request
          </ModalHeader>
          <ModalCloseButton color="gray.900" />
          <ModalBody>
            <Text color="gray.900" fontFamily="'Playfair Display', serif">
              Are you sure you want to reject this property listing request? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onRejectClose}
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
              bg="red.600"
              color="white"
              borderRadius="0"
              onClick={confirmReject}
              _hover={{
                bg: 'red.700',
              }}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default PropertyRequestsPage;

