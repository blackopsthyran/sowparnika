import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  HStack,
  Select,
  Flex,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import { FiHome, FiSave } from 'react-icons/fi';
import Link from 'next/link';

const CreateTestimonialPage = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    image: '',
    testimonial: '',
    status: 'active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTestimonial, setIsLoadingTestimonial] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push(`/login?returnUrl=/cpanel/create-testimonial${id ? `?id=${id}` : ''}`);
    }
  }, [isAuthenticated, isLoading, isAdmin, router, id]);

  const fetchTestimonial = useCallback(async () => {
    try {
      setIsLoadingTestimonial(true);
      const response = await fetch('/api/get-testimonials');
      const data = await response.json();

      if (response.ok && data.testimonials) {
        const testimonial = data.testimonials.find((t: any) => t.id === id);
        if (testimonial) {
          setFormData({
            name: testimonial.name || '',
            company: testimonial.company || '',
            image: testimonial.image || '',
            testimonial: testimonial.testimonial || '',
            status: testimonial.status || 'active',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Testimonial not found',
            status: 'error',
            duration: 3000,
          });
          router.push('/cpanel/testimonials');
        }
      }
    } catch (error: any) {
      console.error('Error fetching testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to load testimonial',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoadingTestimonial(false);
    }
  }, [id, toast, router]);

  useEffect(() => {
    if (id && isAuthenticated && isAdmin) {
      fetchTestimonial();
    }
  }, [id, isAuthenticated, isAdmin, fetchTestimonial]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.company.trim() || !formData.testimonial.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      const url = id ? '/api/update-testimonial' : '/api/create-testimonial';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(id && { id }),
          name: formData.name.trim(),
          company: formData.company.trim(),
          image: formData.image.trim(),
          testimonial: formData.testimonial.trim(),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: id ? 'Testimonial updated successfully' : 'Testimonial created successfully',
          status: 'success',
          duration: 3000,
        });
        router.push('/cpanel/testimonials');
      } else {
        throw new Error(data.error || 'Failed to save testimonial');
      }
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save testimonial. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingTestimonial) {
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
    <DefaultLayout 
      title={id ? 'Edit Testimonial' : 'Create Testimonial'} 
      description={id ? 'Edit testimonial' : 'Create new testimonial'}
    >
      <Box bg="white" minH="100vh" py={12} pb={{ base: 24, md: 12 }}>
        <Container maxW="container.md">
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
                  {id ? 'Edit Testimonial' : 'Create Testimonial'}
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  {id ? 'Update testimonial information' : 'Add a new testimonial to your website'}
                </Text>
              </Box>
              <Link href="/cpanel/testimonials">
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
                  Back to Testimonials
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
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel 
                      color="gray.900" 
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Name
                    </FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter client name"
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
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      color="gray.900" 
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Company / Location
                    </FormLabel>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter company name or location"
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
                  </FormControl>

                  <FormControl>
                    <FormLabel 
                      color="gray.900" 
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Image URL (Optional)
                    </FormLabel>
                    <Input
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
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
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Leave empty if you don&apos;t have an image
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      color="gray.900" 
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Testimonial
                    </FormLabel>
                    <Textarea
                      name="testimonial"
                      value={formData.testimonial}
                      onChange={handleInputChange}
                      placeholder="Enter the testimonial text"
                      rows={6}
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
                  </FormControl>

                  <FormControl>
                    <FormLabel 
                      color="gray.900" 
                      fontFamily="'Playfair Display', serif"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      Status
                    </FormLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      borderRadius="0"
                      _focus={{
                        borderColor: 'gray.900',
                        boxShadow: '0 0 0 1px gray.900',
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </FormControl>

                  <HStack spacing={4} justify="flex-end" pt={4}>
                    <Link href="/cpanel/testimonials">
                      <Button
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
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      leftIcon={<FiSave />}
                      bg="gray.900"
                      color="white"
                      borderRadius="0"
                      fontWeight="600"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      _hover={{
                        bg: 'gray.800',
                      }}
                      isLoading={isSubmitting}
                      loadingText={id ? 'Updating...' : 'Creating...'}
                      fontFamily="'Playfair Display', serif"
                    >
                      {id ? 'Update Testimonial' : 'Create Testimonial'}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default CreateTestimonialPage;

