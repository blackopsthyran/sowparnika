import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Checkbox,
  useToast,
  HStack,
  Icon,
  Card,
  CardBody,
  Image,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import {
  FiHome,
  FiDollarSign,
  FiMapPin,
  FiUser,
  FiCheckSquare,
  FiImage,
  FiX,
  FiUpload,
} from 'react-icons/fi';
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const EditListingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    propertyType: '',
    bhk: '',
    sellingType: 'Sale',
    price: '',
    areaSize: '',
    areaUnit: 'Sq. Ft.',
    city: '',
    address: '',
    state: '',
    ownerName: '',
    ownerNumber: '',
    status: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const amenityOptions = [
    'Balcony',
    'Covered Parking',
    'Open Parking',
    'Lift',
    '24/7 Security',
    'Clubhouse',
    'Swimming Pool',
    'Gymnasium',
    'Park',
    'Power Backup',
    'Vaastu Compliant',
    '24/7 Water Supply',
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchProperty = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/get-property?id=${id}`);
      const data = await response.json();

      if (response.ok && data.property) {
        const property = data.property;
        setFormData({
          title: property.title || '',
          content: property.content || '',
          propertyType: property.property_type || '',
          bhk: property.bhk?.toString() || '',
          sellingType: property.selling_type || 'Sale',
          price: property.price?.toString() || '',
          areaSize: property.area_size?.toString() || '',
          areaUnit: property.area_unit || 'Sq. Ft.',
          city: property.city || '',
          address: property.address || '',
          state: property.state || '',
          ownerName: property.owner_name || '',
          ownerNumber: property.owner_number || '',
          status: property.status || 'active',
        });
        setAmenities(Array.isArray(property.amenities) ? property.amenities : []);
        setExistingImages(Array.isArray(property.images) ? property.images : []);
      } else {
        toast({
          title: 'Error',
          description: 'Property not found',
          status: 'error',
        });
        router.push('/cpanel/listings');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchProperty();
    }
  }, [id, isAuthenticated, fetchProperty]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setNewImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleAmenityChange = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          if (result.url) {
            newImageUrls.push(result.url);
          }
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update property
      const response = await fetch('/api/update-property', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData,
          amenities,
          images: allImages,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Property updated successfully!',
          status: 'success',
          duration: 5000,
        });
        router.push('/cpanel/listings');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to update property');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update property. Please try again.',
        status: 'error',
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <DefaultLayout title="Edit Listing" description="Edit property listing">
        <Container maxW="container.xl" py="4rem">
          <Text>Loading...</Text>
        </Container>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DefaultLayout title="Edit Listing" description="Edit property listing">
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="xl" mb={2} color="blue.700">
                  Edit Listing
                </Heading>
                <Text color="gray.600">Update property information</Text>
              </Box>
              <Link href="/cpanel/listings">
                <Button variant="outline">Back to Listings</Button>
              </Link>
            </Flex>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Basic Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel>Property Title</FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel>Description</FormLabel>
                        <Box border="1px" borderColor="gray.300" borderRadius="md" overflow="hidden">
                          <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            style={{ minHeight: '200px' }}
                          />
                        </Box>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Property Type</FormLabel>
                        <Select
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Type</option>
                          <option value="Apartment">Apartment</option>
                          <option value="House">House</option>
                          <option value="Villa">Villa</option>
                          <option value="Studio">Studio</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Townhouse">Townhouse</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>BHK</FormLabel>
                        <Select
                          name="bhk"
                          value={formData.bhk}
                          onChange={handleInputChange}
                        >
                          <option value="">Select BHK</option>
                          <option value="1">1 BHK</option>
                          <option value="2">2 BHK</option>
                          <option value="3">3 BHK</option>
                          <option value="4">4 BHK</option>
                          <option value="5+">5+ BHK</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Selling Type</FormLabel>
                        <Select
                          name="sellingType"
                          value={formData.sellingType}
                          onChange={handleInputChange}
                        >
                          <option value="Sale">For Sale</option>
                          <option value="Rent">For Rent</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Price & Location Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Price & Location</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Price</FormLabel>
                        <Input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Area Size</FormLabel>
                        <HStack>
                          <Input
                            name="areaSize"
                            type="number"
                            value={formData.areaSize}
                            onChange={handleInputChange}
                          />
                          <Select
                            name="areaUnit"
                            value={formData.areaUnit}
                            onChange={handleInputChange}
                            width="140px"
                          >
                            <option value="Sq. Ft.">Sq. Ft.</option>
                            <option value="Sq. M.">Sq. M.</option>
                            <option value="Sq. Yd.">Sq. Yd.</option>
                          </Select>
                        </HStack>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>City</FormLabel>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>State</FormLabel>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel>Full Address</FormLabel>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Owner Details Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Owner Details</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Owner Name</FormLabel>
                        <Input
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Contact Number</FormLabel>
                        <Input
                          name="ownerNumber"
                          type="tel"
                          value={formData.ownerNumber}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Amenities Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Amenities</Heading>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                      {amenityOptions.map((amenity) => (
                        <Checkbox
                          key={amenity}
                          isChecked={amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                        >
                          {amenity}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Images Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Images</Heading>
                    <VStack spacing={4} align="stretch">
                      {existingImages.length > 0 && (
                        <Box>
                          <Text mb={2} fontWeight="medium">Existing Images</Text>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            {existingImages.map((imageUrl, index) => (
                              <Box key={index} position="relative">
                                <Image
                                  src={imageUrl}
                                  alt={`Existing ${index + 1}`}
                                  borderRadius="md"
                                  fallbackSrc="https://placehold.co/200x150/e2e8f0/64748b?text=No+Image"
                                />
                                <IconButton
                                  aria-label="Remove"
                                  icon={<FiX />}
                                  size="sm"
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  onClick={() => removeExistingImage(index)}
                                  colorScheme="red"
                                />
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}

                      <FormControl>
                        <FormLabel>Add New Images</FormLabel>
                        <Box
                          {...getRootProps()}
                          border="2px dashed"
                          borderColor={isDragActive ? 'blue.500' : 'gray.300'}
                          borderRadius="md"
                          p={8}
                          textAlign="center"
                          cursor="pointer"
                        >
                          <input {...getInputProps()} />
                          <VStack spacing={2}>
                            <Icon as={FiUpload} boxSize={8} />
                            <Text>
                              {isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}
                            </Text>
                          </VStack>
                        </Box>
                        {newImages.length > 0 && (
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
                            {newImages.map((image, index) => (
                              <Box key={index} position="relative">
                                <Image
                                  src={URL.createObjectURL(image)}
                                  alt={`New ${index + 1}`}
                                  borderRadius="md"
                                />
                                <IconButton
                                  aria-label="Remove"
                                  icon={<FiX />}
                                  size="sm"
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  onClick={() => removeNewImage(index)}
                                  colorScheme="red"
                                />
                              </Box>
                            ))}
                          </SimpleGrid>
                        )}
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Status</FormLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  loadingText="Updating..."
                >
                  Update Listing
                </Button>
              </VStack>
            </form>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default EditListingPage;

