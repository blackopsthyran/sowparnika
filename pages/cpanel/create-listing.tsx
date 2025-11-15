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
  FiZap,
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
    landArea: '',
    landAreaUnit: 'Cent',
    city: 'Kochi',
    address: '',
    state: 'Kerala',
    ownerName: '',
    ownerNumber: '',
    status: 'active',
  });

  // Property types that don't require bedrooms/bathrooms
  const landPropertyTypes = ['plot', 'land', 'commercial land'];
  const commercialPropertyTypes = ['warehouse', 'commercial building', 'commercial space/office space'];
  const showBedroomsBathrooms = formData.propertyType && 
    !landPropertyTypes.includes(formData.propertyType.toLowerCase()) &&
    !commercialPropertyTypes.includes(formData.propertyType.toLowerCase());
  
  // Show floors field for Commercial Building and Commercial Space/Office Space
  const showFloors = formData.propertyType && 
    (formData.propertyType.toLowerCase() === 'commercial building' || 
     formData.propertyType.toLowerCase() === 'commercial space/office space');
  
  // Show land area field for House and Villa
  const showLandArea = formData.propertyType && 
    (formData.propertyType.toLowerCase() === 'house' || formData.propertyType.toLowerCase() === 'villa');

  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

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
    // Also set areaUnit to 'Cent' for land/plot/commercial building types
    if (name === 'propertyType') {
      const landAndCommercialTypes = ['Plot', 'Land', 'Commercial Land', 'Commercial Building', 'Commercial Space/Office Space'];
      const shouldUseCent = landAndCommercialTypes.includes(value);
      const isHouseOrVilla = value.toLowerCase() === 'house' || value.toLowerCase() === 'villa';
      
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        bhk: '',
        baths: '',
        floors: '',
        areaUnit: shouldUseCent ? 'Cent' : 'Sq. Ft.',
        // Clear land area if not House/Villa
        landArea: isHouseOrVilla ? prev.landArea : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleEnhanceDescription = async () => {
    if (!formData.content || formData.content.trim().length === 0) {
      toast({
        title: 'No text to enhance',
        description: 'Please enter some description text first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.content,
          propertyType: formData.propertyType,
          city: formData.city,
          price: formData.price,
          bhk: formData.bhk,
          baths: formData.baths,
          areaSize: formData.areaSize,
          areaUnit: formData.areaUnit,
          type: 'description',
        }),
      });

      const data = await response.json();

      if (response.ok && data.enhancedText) {
        setFormData((prev) => ({ ...prev, content: data.enhancedText }));
        toast({
          title: 'Description enhanced',
          description: 'Your description has been improved using AI',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Failed to enhance description');
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast({
        title: 'Enhancement failed',
        description: error.message || 'Failed to enhance description. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEnhancing(false);
    }
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

        // Handle responses - check Content-Type first, then parse carefully
        let result: any = {};
        const contentType = uploadResponse.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        
        // Read response as text first to handle truncation issues on Vercel
        const responseText = await uploadResponse.text();
        
        if (!responseText || !responseText.trim()) {
          // Empty response - likely a timeout or crash on Vercel
          console.error(`[FRONTEND] Image ${i + 1} - Empty response from server (likely timeout)`);
          result = {
            error: 'Server timeout or error',
            details: 'The server did not return a response. This may be due to a timeout or server error. Try uploading a smaller image or check Vercel logs.',
            statusCode: uploadResponse.status || 500,
          };
        } else if (!isJson) {
          // Response is not JSON
          console.error(`[FRONTEND] Image ${i + 1} - Non-JSON response. Content-Type: ${contentType}, Length: ${responseText.length}`);
          result = {
            error: 'Invalid response format',
            details: `Server returned non-JSON response (Content-Type: ${contentType}). Response length: ${responseText.length}`,
            statusCode: uploadResponse.status,
          };
        } else {
          // Try to parse JSON - handle truncation and malformed JSON
          try {
            // Trim whitespace and try to extract valid JSON if truncated
            let jsonText = responseText.trim();
            
            // If response doesn't start with { or [, it might be truncated or have extra content
            if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
              // Try to find the first { or [
              const firstBrace = jsonText.indexOf('{');
              const firstBracket = jsonText.indexOf('[');
              if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket)) {
                jsonText = jsonText.substring(firstBrace);
              } else if (firstBracket >= 0) {
                jsonText = jsonText.substring(firstBracket);
              }
            }
            
            // If response doesn't end with } or ], try to find the last complete object/array
            if (!jsonText.endsWith('}') && !jsonText.endsWith(']')) {
              // Try to find the last } or ] and extract up to that point
              const lastBrace = jsonText.lastIndexOf('}');
              const lastBracket = jsonText.lastIndexOf(']');
              if (lastBrace > lastBracket) {
                jsonText = jsonText.substring(0, lastBrace + 1);
              } else if (lastBracket > 0) {
                jsonText = jsonText.substring(0, lastBracket + 1);
              }
            }
            
            result = JSON.parse(jsonText);
          } catch (parseError: any) {
            console.error(`[FRONTEND] Image ${i + 1} - Failed to parse JSON response:`, parseError);
            console.error(`[FRONTEND] Response text (first 500 chars):`, responseText.substring(0, 500));
            console.error(`[FRONTEND] Response length:`, responseText.length);
            
            // Check if upload was successful by looking at response content
            const hasUrl = responseText.includes('"url"') || responseText.includes('url:');
            const hasSuccess = responseText.includes('"success":true') || responseText.includes('success:true');
            
            if (hasUrl && hasSuccess) {
              // Partial JSON but seems successful - try to extract URL manually
              const urlMatch = responseText.match(/"url"\s*:\s*"([^"]+)"/) || responseText.match(/url["']?\s*[:=]\s*["']([^"']+)["']/);
              if (urlMatch && urlMatch[1]) {
                console.log(`[FRONTEND] Image ${i + 1} - Extracted URL from truncated response:`, urlMatch[1]);
                result = {
                  url: urlMatch[1],
                  success: true,
                  warning: 'Response was truncated but upload appears successful',
                };
              } else {
                result = {
                  error: 'Partial response received',
                  details: 'The server response was truncated but upload may have succeeded. Check your Supabase storage.',
                  statusCode: uploadResponse.status,
                  rawResponse: responseText.substring(0, 200),
                };
              }
            } else {
              result = {
                error: 'Invalid response from server',
                details: `The server returned a response that could not be parsed as JSON: ${parseError.message}`,
                statusCode: uploadResponse.status,
                rawResponse: responseText.substring(0, 200),
              };
            }
          }
        }
        
        if (uploadResponse.ok && result.url && !result.error && result.success) {
          imageUrls.push(result.url);
          console.log(`[FRONTEND] Image ${i + 1} uploaded successfully:`, result.url);
        } else {
          // Handle error - check if it's a placeholder URL with error
          const errorMessage = result.error || result.details || 'Upload failed';
          const errorHelp = result.help || '';
          const statusCode = uploadResponse.status || result.statusCode || 'unknown';
          
          uploadErrors.push(`Image ${i + 1}: ${errorMessage}${errorHelp ? ` - ${errorHelp}` : ''} (Status: ${statusCode})`);
          
          // Log detailed error for debugging
          console.error(`[FRONTEND] Image ${i + 1} upload error:`, {
            imageIndex: i + 1,
            httpStatus: uploadResponse.status,
            error: result.error,
            details: result.details,
            help: result.help,
            statusCode: result.statusCode,
            fullResponse: result,
            responseTextLength: responseText?.length || 0,
          });
        }
      }

      // Show upload errors if any
      if (uploadErrors.length > 0) {
        toast({
          title: 'Image Upload Errors',
          description: uploadErrors.join('; '),
          status: 'warning',
          duration: 10000,
          isClosable: true,
        });
        
        // If no images were uploaded successfully, stop here
        if (imageUrls.length === 0) {
          setIsSubmitting(false);
          return;
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
          // Only include land area for House and Villa
          landArea: showLandArea ? formData.landArea : '',
          landAreaUnit: showLandArea ? formData.landAreaUnit : '',
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
                        <FormLabel 
                          color="gray.900" 
                          fontWeight="600" 
                          fontSize="sm" 
                          letterSpacing="0.05em" 
                          textTransform="uppercase"
                          mb={2}
                        >
                          Property Title
                        </FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Luxury 3BHK Apartment in Kochi"
                          bg="white"
                          borderColor="gray.300"
                          color="gray.900"
                          borderRadius="0"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>

                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <FormLabel 
                            color="gray.900" 
                            fontWeight="600" 
                            fontSize="sm" 
                            letterSpacing="0.05em" 
                            textTransform="uppercase"
                            mb={0}
                          >
                            Description
                          </FormLabel>
                          <Button
                            size="sm"
                            leftIcon={<FiZap />}
                            onClick={handleEnhanceDescription}
                            isLoading={isEnhancing}
                            loadingText="Enhancing..."
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            _hover={{
                              borderColor: 'blue.400',
                              color: 'blue.600',
                              bg: 'blue.50',
                            }}
                            fontSize="xs"
                            fontWeight="600"
                            borderRadius="0"
                          >
                            Enhance with AI
                          </Button>
                        </Flex>
                        <Box border="1px" borderColor="gray.300" borderRadius="0" overflow="hidden">
                          <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            style={{ minHeight: '200px' }}
                            placeholder="Enter property description... Click 'Enhance with AI' to improve your text"
                          />
                        </Box>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Tip: Write a basic description and click &ldquo;Enhance with AI&rdquo; to make it more engaging and professional
                        </Text>
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
                          <option value="Commercial Space/Office Space">Commercial Space/Office Space</option>
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
                            <option value="Ground Floor">Ground Floor</option>
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

                    {showLandArea && (
                      <FormControl>
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                          Land Area / Plot Area
                        </FormLabel>
                          <HStack spacing={2}>
                            <Input
                              name="landArea"
                              type="number"
                              value={formData.landArea}
                              onChange={handleInputChange}
                              placeholder="Enter land area"
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
                              name="landAreaUnit"
                              value={formData.landAreaUnit}
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
                              <option value="Cent">Cent</option>
                              <option value="Cents">Cents</option>
                              <option value="Acre">Acre</option>
                              <option value="Acres">Acres</option>
                              <option value="Sq. Ft.">Sq. Ft.</option>
                              <option value="Sq. M.">Sq. M.</option>
                              <option value="Sq. Yd.">Sq. Yd.</option>
                              <option value="Ground">Ground</option>
                              <option value="Grounds">Grounds</option>
                              <option value="Gunta">Gunta</option>
                              <option value="Guntas">Guntas</option>
                            </Select>
                          </HStack>
                        </FormControl>
                    )}

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

