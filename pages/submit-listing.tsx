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
  Image,
  IconButton,
  Flex,
  Icon,
} from '@chakra-ui/react';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import {
  FiX,
  FiUpload,
  FiArrowLeft,
} from 'react-icons/fi';
import Link from 'next/link';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const SubmitListingPage = () => {
  const router = useRouter();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    propertyType: '',
    bhk: '',
    baths: '',
    sellingType: 'Sale',
    price: '',
    areaSize: '',
    areaUnit: 'Sq. Ft.',
    city: '',
    address: '',
    state: 'Kerala',
    ownerName: '',
    ownerNumber: '',
    ownerEmail: '',
  });

  // Property types that don't require bedrooms/bathrooms
  const landPropertyTypes = ['plot', 'land', 'commercial land'];
  const showBedroomsBathrooms = formData.propertyType && !landPropertyTypes.includes(formData.propertyType.toLowerCase());

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload images
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

      // Submit listing request
      const response = await fetch('/api/submit-listing-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amenities: showBedroomsBathrooms ? amenities : [],
          images: imageUrls,
          // Clear BHK and baths for land types
          bhk: showBedroomsBathrooms ? formData.bhk : '',
          baths: showBedroomsBathrooms ? formData.baths : '',
          request_status: 'pending', // All user submissions start as pending
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Request Submitted',
          description: 'Your listing request has been submitted successfully. We will review it and get back to you soon.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Reset form
        setFormData({
          title: '',
          content: '',
          propertyType: '',
          bhk: '',
          baths: '',
          sellingType: 'Sale',
          price: '',
          areaSize: '',
          areaUnit: 'Sq. Ft.',
          city: '',
          address: '',
          state: 'Kerala',
          ownerName: '',
          ownerNumber: '',
          ownerEmail: '',
        });
        setAmenities([]);
        setImages([]);
        router.push('/');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to submit listing request');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit listing request. Please try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout title="Submit Listing Request" description="Submit a property listing request">
      <Box bg="white" minH="100vh" py={12}>
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
                  Submit Listing Request
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Fill out the form below to submit your property listing. Our team will review and approve it.
                </Text>
              </Box>
              <Link href="/">
                <Button 
                  leftIcon={<FiArrowLeft />}
                  variant="outline"
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
                  Back to Home
                </Button>
              </Link>
            </Flex>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information Card */}
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
                    Basic Information
                  </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                          Property Title
                        </FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Luxury 3BHK Apartment"
                          bg="white"
                          borderColor="gray.300"
                          color="gray.900"
                          borderRadius="0"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>

                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                          Description
                        </FormLabel>
                        <Box border="1px" borderColor="gray.300" borderRadius="0" overflow="hidden">
                          <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            style={{ minHeight: '200px' }}
                          />
                        </Box>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                          Property Type
                        </FormLabel>
                        <Select
                          name="propertyType"
                          value={formData.propertyType}
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
                          <option value="">Select Type</option>
                          <option value="Apartment">Apartment</option>
                          <option value="House">House</option>
                          <option value="Villa">Villa</option>
                          <option value="Flat">Flat</option>
                          <option value="Studio">Studio</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Plot">Plot</option>
                          <option value="Land">Land</option>
                          <option value="Commercial Land">Commercial Land</option>
                          <option value="Warehouse">Warehouse</option>
                          <option value="Commercial Building">Commercial Building</option>
                        </Select>
                      </FormControl>

                      {showBedroomsBathrooms && (
                        <>
                          <FormControl isRequired>
                            <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                              BHK / Bedrooms
                            </FormLabel>
                            <Select
                              name="bhk"
                              value={formData.bhk}
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
                              <option value="">Select BHK</option>
                              <option value="1">1 BHK</option>
                              <option value="2">2 BHK</option>
                              <option value="3">3 BHK</option>
                              <option value="4">4 BHK</option>
                              <option value="5">5 BHK</option>
                              <option value="6">6 BHK</option>
                              <option value="7+">7+ BHK</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                              Bathrooms
                            </FormLabel>
                            <Select
                              name="baths"
                              value={formData.baths}
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
                              <option value="">Select Bathrooms</option>
                              <option value="1">1 Bathroom</option>
                              <option value="2">2 Bathrooms</option>
                              <option value="3">3 Bathrooms</option>
                              <option value="4">4 Bathrooms</option>
                              <option value="5">5 Bathrooms</option>
                              <option value="6+">6+ Bathrooms</option>
                            </Select>
                          </FormControl>
                        </>
                      )}

                      <FormControl isRequired>
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                          Selling Type
                        </FormLabel>
                        <Select
                          name="sellingType"
                          value={formData.sellingType}
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
                          <option value="Sale">For Sale</option>
                          <option value="Rent">For Rent</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                </Box>

                {/* Price & Location Card */}
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
                    Price & Location
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Price (₹)
                      </FormLabel>
                      <Input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
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
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Area Size
                      </FormLabel>
                      <HStack spacing={2}>
                        <Input
                          name="areaSize"
                          type="number"
                          value={formData.areaSize}
                          onChange={handleInputChange}
                          placeholder="Enter area"
                          bg="white"
                          borderColor="gray.300"
                          color="gray.900"
                          borderRadius="0"
                          _placeholder={{ color: 'gray.400' }}
                          _focus={{
                            borderColor: 'gray.900',
                            boxShadow: '0 0 0 1px gray.900',
                          }}
                          flex="1"
                          minW="0"
                        />
                        <Select
                          name="areaUnit"
                          value={formData.areaUnit}
                          onChange={handleInputChange}
                          bg="white"
                          borderColor="gray.300"
                          color="gray.900"
                          borderRadius="0"
                          _focus={{
                            borderColor: 'gray.900',
                            boxShadow: '0 0 0 1px gray.900',
                          }}
                          flex="1"
                          minW="0"
                        >
                          <option value="Sq. Ft.">Sq. Ft.</option>
                          <option value="Sq. M.">Sq. M.</option>
                          <option value="Sq. Yd.">Sq. Yd.</option>
                          <option value="Acre">Acre</option>
                          <option value="Acres">Acres</option>
                          <option value="Cent">Cent</option>
                          <option value="Cents">Cents</option>
                          <option value="Ground">Ground</option>
                          <option value="Grounds">Grounds</option>
                          <option value="Gunta">Gunta</option>
                          <option value="Guntas">Guntas</option>
                        </Select>
                      </HStack>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        City
                      </FormLabel>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
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
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        State
                      </FormLabel>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
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

                    <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Full Address
                      </FormLabel>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter full address"
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
                  </SimpleGrid>
                </Box>

                {/* Owner Details Card */}
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
                    Contact Details
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Your Name
                      </FormLabel>
                      <Input
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
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
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Email Address
                      </FormLabel>
                      <Input
                        name="ownerEmail"
                        type="email"
                        value={formData.ownerEmail}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
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
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Contact Number
                      </FormLabel>
                      <Input
                        name="ownerNumber"
                        type="tel"
                        value={formData.ownerNumber}
                        onChange={handleInputChange}
                        placeholder="Enter contact number"
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
                  </SimpleGrid>
                </Box>

                {/* Amenities Card */}
                {showBedroomsBathrooms && (
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
                      Amenities
                    </Heading>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      {amenityOptions.map((amenity) => (
                        <Checkbox
                          key={amenity}
                          isChecked={amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          colorScheme="gray"
                          borderColor="gray.300"
                          _checked={{
                            bg: 'gray.900',
                            borderColor: 'gray.900',
                            color: 'white',
                          }}
                          color="gray.900"
                        >
                          <Text
                            fontSize="sm"
                            fontFamily="'Playfair Display', serif"
                            color="gray.900"
                          >
                            {amenity}
                          </Text>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Images Card */}
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
                    Property Images
                  </Heading>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase" mb={3}>
                        Upload Images
                      </FormLabel>
                      <Box
                        {...getRootProps()}
                        border="2px dashed"
                        borderColor={isDragActive ? 'gray.900' : 'gray.300'}
                        borderRadius="0"
                        p={12}
                        textAlign="center"
                        cursor="pointer"
                        bg={isDragActive ? 'gray.50' : 'white'}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: 'gray.900',
                          bg: 'gray.50',
                        }}
                      >
                        <input {...getInputProps()} />
                        <VStack spacing={3}>
                          <Icon as={FiUpload} boxSize={10} color="gray.900" />
                          <Text color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="500">
                            {isDragActive ? 'Drop images here' : 'Drag & drop or click to upload images'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            PNG, JPG, JPEG up to 10MB each
                          </Text>
                        </VStack>
                      </Box>
                      {images.length > 0 && (
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={6}>
                          {images.map((image, index) => (
                            <Box key={index} position="relative" border="2px solid" borderColor="gray.300" borderRadius="0" overflow="hidden">
                              <Image
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                width="100%"
                                height="200px"
                                objectFit="cover"
                              />
                              <IconButton
                                aria-label="Remove"
                                icon={<FiX />}
                                size="sm"
                                position="absolute"
                                top={2}
                                right={2}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                bg="red.600"
                                color="white"
                                borderRadius="0"
                                _hover={{
                                  bg: 'red.700',
                                }}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}
                    </FormControl>
                  </VStack>
                </Box>

                <Button
                  type="submit"
                  size="lg"
                  bg="gray.900"
                  color="white"
                  borderRadius="0"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  _hover={{
                    bg: 'gray.800',
                  }}
                >
                  Submit Listing Request
                </Button>
              </VStack>
            </form>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default SubmitListingPage;

