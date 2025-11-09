import React, { useState, useCallback } from 'react';
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
  Badge,
  Flex,
  Image,
  IconButton,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import ImageReorder from '@/components/ImageReorder';
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

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const CreateListingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Form state
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
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (newOrder: (File | string)[]) => {
    setImages(newOrder as File[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload images to Cloudflare
      const imageUrls: string[] = [];
      const uploadErrors: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          if (result.url) {
            imageUrls.push(result.url);
          } else {
            uploadErrors.push(`Image ${i + 1}: No URL returned`);
          }
        } else {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }));
          uploadErrors.push(`Image ${i + 1}: ${errorData.error || 'Upload failed'}`);
        }
      }

      // Save to database
      const response = await fetch('/api/create-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amenities,
          images: imageUrls,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: result.message || 'Property listing created successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/properties');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.message || 'Failed to create listing. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout title="Create Listing" description="Create a new property listing">
        <Container maxW="container.xl" py="4rem">
          <Text>Loading...</Text>
        </Container>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <DefaultLayout title="Create Listing" description="Create a new property listing">
      <Box
        minH="100vh"
        bgGradient="linear(to-br, blue.50, white)"
        py={{ base: 8, md: 12 }}
      >
        <Container maxW="6xl">
          {/* Header Section */}
          <Box mb={10}>
            <HStack spacing={3} mb={3}>
              <Icon as={FiHome} boxSize={8} color="blue.600" />
              <Heading
                size="2xl"
                bgGradient="linear(to-r, blue.600, blue.400)"
                bgClip="text"
                fontWeight="bold"
              >
                Create New Listing
              </Heading>
            </HStack>
            <Text color="gray.600" fontSize="lg">
              Fill in the details below to add a new property to your listings
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={8} align="stretch">
              {/* Basic Information Card */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box
                  bgGradient="linear(to-r, blue.600, blue.500)"
                  px={6}
                  py={4}
                  color="white"
                >
                  <HStack spacing={3}>
                    <Icon as={FiHome} boxSize={5} />
                    <Heading size="md" fontWeight="semibold">
                      Basic Information
                    </Heading>
                  </HStack>
                </Box>
                <CardBody p={8}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Property Title
                      </FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Luxury 3BHK Apartment in Downtown"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>

                    <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Description
                      </FormLabel>
                      <Box
                        border="1px"
                        borderColor="gray.300"
                        borderRadius="lg"
                        overflow="hidden"
                        _focusWithin={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      >
                        <ReactQuill
                          theme="snow"
                          value={formData.content}
                          onChange={handleContentChange}
                          style={{ minHeight: '200px' }}
                          placeholder="Describe your property in detail..."
                        />
                      </Box>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Property Type
                      </FormLabel>
                      <Select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        placeholder="Select Type"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Villa">Villa</option>
                        <option value="Studio">Studio</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Townhouse">Townhouse</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        BHK Configuration
                      </FormLabel>
                      <Select
                        name="bhk"
                        value={formData.bhk}
                        onChange={handleInputChange}
                        placeholder="Select BHK"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      >
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                        <option value="5+">5+ BHK</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Selling Type
                      </FormLabel>
                      <Select
                        name="sellingType"
                        value={formData.sellingType}
                        onChange={handleInputChange}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      >
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Price & Location Card */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box
                  bgGradient="linear(to-r, green.600, green.500)"
                  px={6}
                  py={4}
                  color="white"
                >
                  <HStack spacing={3}>
                    <Icon as={FiDollarSign} boxSize={5} />
                    <Heading size="md" fontWeight="semibold">
                      Price & Location
                    </Heading>
                  </HStack>
                </Box>
                <CardBody p={8}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Price
                      </FormLabel>
                      <Input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter Price"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Area Size
                      </FormLabel>
                      <HStack spacing={3}>
                        <Input
                          name="areaSize"
                          type="number"
                          value={formData.areaSize}
                          onChange={handleInputChange}
                          placeholder="Enter Area Size"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                        />
                        <Select
                          name="areaUnit"
                          value={formData.areaUnit}
                          onChange={handleInputChange}
                          width="140px"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                        >
                          <option value="Sq. Ft.">Sq. Ft.</option>
                          <option value="Sq. M.">Sq. M.</option>
                          <option value="Sq. Yd.">Sq. Yd.</option>
                        </Select>
                      </HStack>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        City
                      </FormLabel>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter City"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        State
                      </FormLabel>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter State"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>

                    <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        <HStack spacing={2}>
                          <Icon as={FiMapPin} />
                          <Text>Full Address</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter complete address"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Owner Details Card */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box
                  bgGradient="linear(to-r, purple.600, purple.500)"
                  px={6}
                  py={4}
                  color="white"
                >
                  <HStack spacing={3}>
                    <Icon as={FiUser} boxSize={5} />
                    <Heading size="md" fontWeight="semibold">
                      Owner Details
                    </Heading>
                  </HStack>
                </Box>
                <CardBody p={8}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Owner Name
                      </FormLabel>
                      <Input
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter owner's full name"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Contact Number
                      </FormLabel>
                      <Input
                        name="ownerNumber"
                        type="tel"
                        value={formData.ownerNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Features & Amenities Card */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box
                  bgGradient="linear(to-r, orange.600, orange.500)"
                  px={6}
                  py={4}
                  color="white"
                >
                  <HStack spacing={3}>
                    <Icon as={FiCheckSquare} boxSize={5} />
                    <Heading size="md" fontWeight="semibold">
                      Features & Amenities
                    </Heading>
                  </HStack>
                </Box>
                <CardBody p={8}>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                    {amenityOptions.map((amenity) => (
                      <Checkbox
                        key={amenity}
                        isChecked={amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        size="lg"
                        colorScheme="blue"
                        p={3}
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.200"
                        _checked={{
                          bg: 'blue.50',
                          borderColor: 'blue.500',
                        }}
                        _hover={{
                          bg: 'gray.50',
                        }}
                      >
                        <Text fontWeight="medium" color="gray.700">
                          {amenity}
                        </Text>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                  {amenities.length > 0 && (
                    <Box mt={6} p={4} bg="blue.50" borderRadius="lg">
                      <Text fontSize="sm" color="blue.700" fontWeight="medium">
                        {amenities.length} amenit{amenities.length === 1 ? 'y' : 'ies'} selected
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>

              {/* Images & Status Card */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box
                  bgGradient="linear(to-r, teal.600, teal.500)"
                  px={6}
                  py={4}
                  color="white"
                >
                  <HStack spacing={3}>
                    <Icon as={FiImage} boxSize={5} />
                    <Heading size="md" fontWeight="semibold">
                      Images & Status
                    </Heading>
                  </HStack>
                </Box>
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Property Images
                      </FormLabel>
                      <Box
                        {...getRootProps()}
                        border="2px dashed"
                        borderColor={isDragActive ? 'blue.500' : 'gray.300'}
                        borderRadius="xl"
                        p={12}
                        textAlign="center"
                        cursor="pointer"
                        bg={isDragActive ? 'blue.50' : 'gray.50'}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: 'blue.400',
                          bg: 'blue.50',
                        }}
                      >
                        <input {...getInputProps()} />
                        <VStack spacing={4}>
                          <Icon
                            as={FiUpload}
                            boxSize={12}
                            color={isDragActive ? 'blue.500' : 'gray.400'}
                          />
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="semibold"
                              color={isDragActive ? 'blue.600' : 'gray.700'}
                              mb={2}
                            >
                              {isDragActive
                                ? 'Drop images here'
                                : 'Drag & drop images here'}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              or click to browse files
                            </Text>
                          </Box>
                          <Button
                            size="md"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<FiUpload />}
                          >
                            Browse Files
                          </Button>
                        </VStack>
                      </Box>
                      {images.length > 0 && (
                        <Box mt={6}>
                          <ImageReorder
                            images={images}
                            onRemove={removeImage}
                            onReorder={reorderImages}
                            isExisting={false}
                          />
                        </Box>
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                        Listing Status
                      </FormLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        placeholder="Select Status"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
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

              {/* Submit Button */}
              <Card
                boxShadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor="gray.100"
                bg="white"
              >
                <CardBody p={8}>
                  <VStack spacing={4}>
                    <Button
                      type="submit"
                      size="lg"
                      width="full"
                      bgGradient="linear(to-r, blue.600, blue.500)"
                      color="white"
                      fontSize="lg"
                      fontWeight="bold"
                      py={7}
                      borderRadius="xl"
                      boxShadow="lg"
                      _hover={{
                        bgGradient: 'linear(to-r, blue.700, blue.600)',
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      isLoading={isSubmitting}
                      loadingText="Creating Listing..."
                      leftIcon={<FiHome />}
                    >
                      Submit Property Listing
                    </Button>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      By submitting, you agree to our terms and conditions
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </form>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default CreateListingPage;
