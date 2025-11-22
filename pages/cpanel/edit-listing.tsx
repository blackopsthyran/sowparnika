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
  Badge,
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

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const EditListingPage = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    propertyTypes: [] as string[], // Changed to array for multiple selections
    bhk: '',
    baths: '',
    floors: '',
    sellingType: 'Sale',
    price: '',
    areaSize: '',
    areaUnit: 'Sq. Ft.',
    landArea: '',
    landAreaUnit: 'Cent',
    city: '',
    address: '',
    state: 'Kerala',
    ownerName: '',
    ownerNumber: '',
    status: '',
  });

  // Property types that don't require bedrooms/bathrooms
  const landPropertyTypes = ['plot', 'land', 'commercial land'];
  const commercialPropertyTypes = ['warehouse', 'commercial building', 'commercial space/office space'];
  
  // Check if any selected property type requires bedrooms/bathrooms
  const hasResidentialType = formData.propertyTypes.some(type => {
    const lowerType = type.toLowerCase();
    return !landPropertyTypes.includes(lowerType) && !commercialPropertyTypes.includes(lowerType);
  });
  const showBedroomsBathrooms = formData.propertyTypes.length > 0 && hasResidentialType;
  
  // Show floors field if Commercial Building or Commercial Space/Office Space is selected
  const showFloors = formData.propertyTypes.some(type => {
    const lowerType = type.toLowerCase();
    return lowerType === 'commercial building' || lowerType === 'commercial space/office space';
  });
  
  // Show land area field if House or Villa is selected
  const showLandArea = formData.propertyTypes.some(type => {
    const lowerType = type.toLowerCase();
    return lowerType === 'house' || lowerType === 'villa';
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
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
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?returnUrl=/cpanel/edit-listing');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  const fetchProperty = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/get-property?id=${id}`);
      const data = await response.json();

      if (response.ok && data.property) {
        const property = data.property;
        // Parse property types - handle both comma-separated string and single value
        const propertyTypesArray = property.property_type
          ? property.property_type.split(',').map((t: string) => t.trim()).filter((t: string) => t)
          : [];
        
        setFormData({
          title: property.title || '',
          content: property.content || '',
          propertyTypes: propertyTypesArray, // Store as array
          bhk: property.bhk?.toString() || '',
          baths: property.baths?.toString() || '',
          floors: property.floors?.toString() || '',
          sellingType: property.selling_type || 'Sale',
          price: property.price?.toString() || '',
          areaSize: property.area_size?.toString() || '',
          areaUnit: property.area_unit || 'Sq. Ft.',
          landArea: property.land_area?.toString() || '',
          landAreaUnit: property.land_area_unit || 'Cent',
          city: property.city || '',
          address: property.address || '',
          state: property.state || 'Kerala',
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

  const handlePropertyTypeChange = (propertyType: string, isChecked: boolean) => {
    setFormData((prev) => {
      let newPropertyTypes: string[];
      
      if (isChecked) {
        // Allow maximum of 3 property types
        if (prev.propertyTypes.length >= 3) {
          toast({
            title: 'Maximum reached',
            description: 'You can select a maximum of 3 property types',
            status: 'warning',
            duration: 3000,
          });
          return prev; // Don't add if already at max
        }
        newPropertyTypes = [...prev.propertyTypes, propertyType];
      } else {
        newPropertyTypes = prev.propertyTypes.filter(type => type !== propertyType);
      }
      
      // Clear BHK, baths, and floors when property types change
      // Determine area unit based on selected types
      const landAndCommercialTypes = ['Plot', 'Land', 'Commercial Land', 'Commercial Building', 'Commercial Space/Office Space'];
      const hasLandOrCommercial = newPropertyTypes.some(type => landAndCommercialTypes.includes(type));
      const hasResidential = newPropertyTypes.some(type => !landAndCommercialTypes.includes(type));
      
      // Use Cent if only land/commercial types, otherwise Sq. Ft.
      const areaUnit = hasLandOrCommercial && !hasResidential ? 'Cent' : 'Sq. Ft.';
      
      // Clear land area if no House/Villa selected
      const hasHouseOrVilla = newPropertyTypes.some(type => 
        type.toLowerCase() === 'house' || type.toLowerCase() === 'villa'
      );
      
      return {
        ...prev,
        propertyTypes: newPropertyTypes,
        bhk: '',
        baths: '',
        floors: '',
        areaUnit,
        landArea: hasHouseOrVilla ? prev.landArea : '',
      };
    });
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
          propertyType: formData.propertyTypes.join(','), // Send as comma-separated
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
        // Log enhancement method for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[Enhance Description] Method:', data.method || 'unknown');
          console.log('[Enhance Description] Original length:', data.originalLength || 'unknown');
          console.log('[Enhance Description] Enhanced length:', data.enhancedLength || 'unknown');
        }
        
        setFormData((prev) => ({ ...prev, content: data.enhancedText }));
        
        toast({
          title: data.method === 'gemini' ? '✅ Description enhanced with AI' : '⚠️ Enhanced with basic formatting',
          description: data.method === 'gemini' 
            ? 'Your description has been improved using Gemini AI' 
            : 'AI enhancement unavailable. Used basic formatting. Check your GEMINI_API_KEY.',
          status: data.method === 'gemini' ? 'success' : 'warning',
          duration: data.method === 'gemini' ? 3000 : 5000,
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

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderExistingImages = (newOrder: (File | string)[]) => {
    setExistingImages(newOrder as string[]);
  };

  const reorderNewImages = (newOrder: (File | string)[]) => {
    setNewImages(newOrder as File[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      const uploadErrors: string[] = [];
      
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
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
          newImageUrls.push(result.url);
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
        if (newImageUrls.length === 0 && newImages.length > 0) {
          setIsSubmitting(false);
          return;
        }
      }

      // Validate that at least one property type is selected
      if (formData.propertyTypes.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one property type',
          status: 'error',
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
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
          propertyType: formData.propertyTypes.join(','), // Send as comma-separated string
          propertyTypes: formData.propertyTypes, // Also send as array for future use
          amenities: showBedroomsBathrooms ? amenities : [],
          images: allImages,
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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <DefaultLayout title="Edit Listing" description="Edit property listing">
      <Box bg="white" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
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
                  Edit Listing
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Update property information
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

            <form onSubmit={handleSubmit} noValidate>
              <VStack spacing={6} align="stretch">
                {/* Basic Information Card */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Basic Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <FormLabel mb={2}>Property Title</FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter property title"
                        />
                      </FormControl>

                      <FormControl isRequired gridColumn={{ base: '1', md: '1 / -1' }}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <FormLabel mb={0}>Description</FormLabel>
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
                          >
                            Enhance with AI
                          </Button>
                        </Flex>
                        <Box border="1px" borderColor="gray.300" borderRadius="md" overflow="hidden">
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
                        <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase" mb={3}>
                          Property Type (Select Multiple)
                        </FormLabel>
                        <Text fontSize="xs" color="gray.600" mb={3} fontStyle="italic">
                          Select 1 to 3 property types. For example, select both &quot;House&quot; and &quot;Villa&quot; so the property appears in searches for both. You can also select &quot;Plot&quot;, &quot;Land&quot;, and &quot;Commercial Land&quot; together.
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                          {[
                            'Apartment',
                            'House',
                            'Villa',
                            'Flat',
                            'Studio',
                            'Penthouse',
                            'Townhouse',
                            'Plot',
                            'Land',
                            'Commercial Land',
                            'Warehouse',
                            'Commercial Building',
                            'Commercial Space/Office Space',
                          ].map((type) => (
                            <HStack key={type} spacing={2} align="center">
                              <Checkbox
                                isChecked={formData.propertyTypes.includes(type)}
                                isDisabled={!formData.propertyTypes.includes(type) && formData.propertyTypes.length >= 3}
                                onChange={(e) => handlePropertyTypeChange(type, e.target.checked)}
                                colorScheme="teal"
                                borderColor="gray.300"
                                size="md"
                                sx={{
                                  '& .chakra-checkbox__control': {
                                    borderColor: formData.propertyTypes.includes(type) ? 'gray.900 !important' : 'gray.300 !important',
                                    bg: formData.propertyTypes.includes(type) ? 'gray.900 !important' : 'white !important',
                                    _checked: {
                                      borderColor: 'gray.900 !important',
                                      bg: 'gray.900 !important',
                                      color: 'white !important',
                                    },
                                  },
                                }}
                                _hover={{
                                  '& .chakra-checkbox__control': {
                                    borderColor: 'gray.900',
                                  },
                                }}
                              />
                              <Text 
                                fontSize="sm" 
                                color="gray.900" 
                                fontWeight="500"
                                cursor="pointer"
                                onClick={() => handlePropertyTypeChange(type, !formData.propertyTypes.includes(type))}
                              >
                                {type}
                              </Text>
                            </HStack>
                          ))}
                        </SimpleGrid>
                        {formData.propertyTypes.length === 0 && (
                          <Text fontSize="xs" color="red.500" mt={2}>
                            Please select at least one property type (you can select up to 3)
                          </Text>
                        )}
                        {formData.propertyTypes.length > 0 && (
                          <HStack spacing={2} mt={3} flexWrap="wrap">
                            <Text fontSize="xs" color="gray.600" fontWeight="600">
                              Selected ({formData.propertyTypes.length}/3):
                            </Text>
                            {formData.propertyTypes.map((type) => (
                              <Badge key={type} colorScheme="teal" fontSize="xs" px={2} py={1}>
                                {type}
                              </Badge>
                            ))}
                            {formData.propertyTypes.length >= 3 && (
                              <Text fontSize="xs" color="orange.500" fontStyle="italic">
                                (Maximum 3 types selected)
                              </Text>
                            )}
                          </HStack>
                        )}
                      </FormControl>

                      {showBedroomsBathrooms && (
                        <>
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
                              <option value="5">5 BHK</option>
                              <option value="6">6 BHK</option>
                              <option value="7+">7+ BHK</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Bathrooms</FormLabel>
                            <Select
                              name="baths"
                              value={formData.baths}
                              onChange={handleInputChange}
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
                          <FormLabel>Number of Floors</FormLabel>
                          <Select
                            name="floors"
                            value={formData.floors}
                            onChange={handleInputChange}
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
                    <VStack spacing={6} align="stretch">
                      {existingImages.length > 0 && (
                        <Box>
                          <Flex align="center" justify="space-between" mb={3}>
                            <Text fontWeight="medium" fontSize="sm" color="gray.700">
                              Existing Images
                            </Text>
                            <Text fontSize="xs" color="gray.500" fontStyle="italic">
                              First image will be the thumbnail
                            </Text>
                          </Flex>
                          <ImageReorder
                            images={existingImages}
                            onRemove={removeExistingImage}
                            onReorder={reorderExistingImages}
                            isExisting={true}
                          />
                        </Box>
                      )}

                      <FormControl>
                        <FormLabel>Add New Images</FormLabel>
                        <Box
                          {...getRootProps()}
                          border="2px dashed"
                          borderColor={isDragActive ? 'blue.500' : 'gray.300'}
                          borderRadius="0"
                          p={8}
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
                        {newImages.length > 0 && (
                          <Box mt={6}>
                            <Text mb={3} fontWeight="medium" fontSize="sm" color="gray.700">
                              New Images
                            </Text>
                            <ImageReorder
                              images={newImages}
                              onRemove={removeNewImage}
                              onReorder={reorderNewImages}
                              isExisting={false}
                            />
                          </Box>
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

