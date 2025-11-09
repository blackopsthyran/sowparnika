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
  FiDollarSign,
  FiMapPin,
  FiUser,
  FiCheckSquare,
  FiImage,
  FiX,
  FiUpload,
  FiHome,
} from 'react-icons/fi';
import Link from 'next/link';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const CreateListingPage = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    propertyType: '',
    bhk: '',
    baths: '',
    floors: '',
    sellingType: 'Sale',
    price: '',
    areaSize: '',
    areaUnit: 'Sq. Ft.',
    city: '',
    address: '',
    state: 'Kerala',
    ownerName: '',
    ownerNumber: '',
    status: '',
  });

  // Property types that don't require bedrooms/bathrooms
  const landPropertyTypes = ['plot', 'land', 'commercial land'];
  const commercialPropertyTypes = ['warehouse', 'commercial building'];
  const showBedroomsBathrooms = formData.propertyType && 
    !landPropertyTypes.includes(formData.propertyType.toLowerCase()) &&
    !commercialPropertyTypes.includes(formData.propertyType.toLowerCase());
  
  // Show floors field only for Commercial Building
  const showFloors = formData.propertyType && 
    formData.propertyType.toLowerCase() === 'commercial building';

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
    
    // If property type changes, clear BHK, baths, and floors to prevent stale data
    if (name === 'propertyType') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        bhk: '',
        baths: '',
        floors: '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

      // Save to database
      const response = await fetch('/api/create-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amenities: showBedroomsBathrooms ? amenities : [],
          images: imageUrls,
          // Clear BHK and baths for land types and commercial types
          bhk: showBedroomsBathrooms ? formData.bhk : '',
          baths: showBedroomsBathrooms ? formData.baths : '',
          // Only include floors for Commercial Building
          floors: showFloors ? formData.floors : '',
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
        router.push('/cpanel/listings');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing. Please try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?returnUrl=/cpanel/create-listing');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <DefaultLayout title="Create Listing" description="Create a new property listing">
        <Container maxW="container.xl" py="4rem">
          <Text>Loading...</Text>
        </Container>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <DefaultLayout title="Create Listing" description="Create a new property listing">
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
                  Create New Listing
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Add a new property to your listings
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
                <Link href="/cpanel/listings">
                  <Button 
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
                    Back to Listings
                  </Button>
                </Link>
              </HStack>
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

                      {showFloors && (
                        <FormControl isRequired>
                          <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                            Number of Floors
                          </FormLabel>
                          <Select
                            name="floors"
                            value={formData.floors}
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
                            <option value="">Select Floors</option>
                            <option value="1">1 Floor</option>
                            <option value="2">2 Floors</option>
                            <option value="3">3 Floors</option>
                            <option value="4">4 Floors</option>
                            <option value="5">5 Floors</option>
                            <option value="6">6 Floors</option>
                            <option value="7">7 Floors</option>
                            <option value="8">8 Floors</option>
                            <option value="9">9 Floors</option>
                            <option value="10">10 Floors</option>
                            <option value="10+">10+ Floors</option>
                          </Select>
                        </FormControl>
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
                    Owner Details
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                        Owner Name
                      </FormLabel>
                      <Input
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter owner name"
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
                      {amenityOptions.map((amenity) => {
                        const isChecked = amenities.includes(amenity);
                        return (
                          <Flex key={amenity} align="center" gap={3}>
                            <Checkbox
                              isChecked={isChecked}
                              onChange={() => handleAmenityChange(amenity)}
                              size="md"
                              borderColor={isChecked ? 'gray.900' : 'gray.400'}
                              _checked={{
                                bg: 'gray.900',
                                borderColor: 'gray.900',
                                color: 'white',
                              }}
                              _hover={{
                                borderColor: 'gray.900',
                              }}
                              flexShrink={0}
                            />
                            <Text
                              fontSize="sm"
                              fontFamily="'Playfair Display', serif"
                              color="gray.900"
                              cursor="pointer"
                              onClick={() => handleAmenityChange(amenity)}
                              userSelect="none"
                            >
                              {amenity}
                            </Text>
                          </Flex>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Images & Status Card */}
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
                    Images & Status
                  </Heading>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase" mb={3}>
                        Property Images
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
                      <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
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
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </Select>
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
                  loadingText="Creating..."
                  _hover={{
                    bg: 'gray.800',
                  }}
                >
                  Create Listing
                </Button>
              </VStack>
            </form>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default CreateListingPage;

