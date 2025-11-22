import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { usePropertyFormat } from '@/features/common/Hooks/usePropertyFormat';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  HStack,
  Icon,
  Badge,
  Divider,
  VStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { TbMapPin, TbEye, TbHeart } from 'react-icons/tb';
import { FiInfo, FiUser, FiPhone, FiHeart, FiShare2 } from 'react-icons/fi';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import PropertyImageGallery from '@/features/Property/components/PropertyImageGallery/PropertyImageGallery';
import PropertyBreadcrumbs from '@/features/Property/components/PropertyBreadcrumbs/PropertyBreadcrumbs';
import ContactAgent from '@/features/Property/components/ContactAgent/ContactAgent';
import { getProperty } from '@/features/Property/API/getProperty';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';

// Helper function to convert price to lakhs/crores
const formatPriceInLakhsCrores = (priceValue: number): string => {
  if (!priceValue || priceValue === 0) return '';
  
  if (priceValue >= 10000000) {
    // Convert to crores
    const crores = priceValue / 10000000;
    return `${crores.toFixed(2)} Cr`;
  } else if (priceValue >= 100000) {
    // Convert to lakhs
    const lakhs = priceValue / 100000;
    return `${lakhs.toFixed(2)} L`;
  }
  return '';
};

const PropertyDetail = ({
  property,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const toast = useToast();
  const {
    address,
    propertyType,
    price,
    title,
    rooms,
    baths,
    purpose,
    sqSize,
    areaUnit,
    landArea,
    landAreaUnit,
    externalID,
    photos,
    description,
    amenities,
  } = usePropertyFormat(property);

  const images = photos as string[];
  
  // Get property metadata
  const propertyCity = property.city || '';
  const propertyState = property.state || '';
  // For House and Villa, show area and land area if available, otherwise show regular area
  const isHouseOrVilla = propertyType?.toLowerCase() === 'house' || propertyType?.toLowerCase() === 'villa';
  // Show land area for all property types if it exists and is not '0'
  const hasLandArea = landArea && parseFloat(landArea) > 0;
  const lotSize = property.area_size ? `${property.area_size} ${property.area_unit || 'sq ft'}` : sqSize;
  const updatedDate = property.updated_at 
    ? new Date(property.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  // Get owner information
  const ownerName = property.owner_name || '';
  const ownerNumber = property.owner_number || '';
  
  // Get property ID for favorites
  const propertyId = property.id || externalID;
  const favorite = isFavorite(propertyId);
  
  const handleFavoriteClick = () => {
    if (isAuthenticated) {
      toggleFavorite(propertyId);
    } else {
      window.location.href = '/login';
    }
  };

  const handleShareClick = async () => {
    const propertyUrl = `${window.location.origin}/properties/${propertyId}`;
    const shareText = `Check out this property: ${title} - ${propertyUrl}`;
    
    // Try to use Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this property: ${title}`,
          url: propertyUrl,
        });
        toast({
          title: 'Shared',
          description: 'Property shared successfully',
          status: 'success',
          duration: 2000,
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          // Fall back to clipboard
          await copyToClipboard(propertyUrl);
        }
      }
    } else {
      // Fall back to clipboard
      await copyToClipboard(propertyUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Link copied',
        description: 'Property link copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Link copied',
          description: 'Property link copied to clipboard',
          status: 'success',
          duration: 2000,
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          status: 'error',
          duration: 2000,
        });
      }
      document.body.removeChild(textArea);
    }
  };

  // SEO Meta Tags
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sowparnikaproperties.com';
  const propertyUrl = `${siteUrl}/properties/${propertyId}`;
  const propertyImage = images && images.length > 0 ? images[0] : `${siteUrl}/logesh.png`;
  const propertyPrice = parseFloat(price.replace(/[^0-9.]/g, '') || '0');
  const propertyDescription = description 
    ? description.replace(/<[^>]*>/g, '').substring(0, 160) 
    : `${title} - ${propertyType} in ${propertyCity}${propertyState ? `, ${propertyState}` : ''}. ${purpose === 'Sale' ? 'For Sale' : 'For Rent'}. ${rooms ? `${rooms} BHK` : ''} ${baths ? `${baths} Bath` : ''}. ${lotSize ? `Area: ${lotSize}` : ''}`;

  // Structured Data for Property
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description: propertyDescription,
    url: propertyUrl,
    image: propertyImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address || '',
      addressLocality: propertyCity || '',
      addressRegion: propertyState || '',
      addressCountry: 'IN'
    },
    geo: propertyCity ? {
      '@type': 'GeoCoordinates',
      latitude: '9.9816',
      longitude: '76.2999'
    } : undefined,
    numberOfRooms: rooms || undefined,
    numberOfBathroomsTotal: baths || undefined,
    floorSize: lotSize ? {
      '@type': 'QuantitativeValue',
      value: property.area_size || sqSize,
      unitCode: property.area_unit || 'SQM'
    } : undefined,
    price: propertyPrice > 0 ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: propertyPrice
    } : undefined,
    category: propertyType,
    offers: {
      '@type': 'Offer',
      price: propertyPrice > 0 ? propertyPrice : undefined,
      priceCurrency: 'INR',
      availability: property.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: propertyUrl
    },
    datePosted: property.created_at || new Date().toISOString(),
    validThrough: property.updated_at || new Date().toISOString()
  };

  // Remove undefined fields from structured data
  const cleanStructuredData: any = {};
  Object.keys(structuredData).forEach(key => {
    const value = structuredData[key as keyof typeof structuredData];
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively clean nested objects
        const cleanedNested: any = {};
        Object.keys(value).forEach(nestedKey => {
          if ((value as any)[nestedKey] !== undefined) {
            cleanedNested[nestedKey] = (value as any)[nestedKey];
          }
        });
        if (Object.keys(cleanedNested).length > 0) {
          cleanStructuredData[key] = cleanedNested;
        }
      } else {
        cleanStructuredData[key] = value;
      }
    }
  });

  const seoTitle = `${title} - ${propertyType} ${purpose === 'Sale' ? 'for Sale' : 'for Rent'} in ${propertyCity}${propertyState ? `, ${propertyState}` : ''} | Sowparnika Properties`;
  const seoKeywords = `${title}, ${propertyType} ${propertyCity}, ${purpose === 'Sale' ? 'property for sale' : 'property for rent'} ${propertyCity}, ${rooms ? `${rooms} BHK` : ''} ${propertyCity}, real estate ${propertyCity}, Sowparnika Properties`;

  return (
    <DefaultLayout 
      title={seoTitle}
      description={propertyDescription}
      keywords={seoKeywords}
      image={propertyImage}
      type="article"
      structuredData={cleanStructuredData}
    >
      <Box bg="white" minH="100vh">
        <Box maxWidth="1400px" margin="0 auto" px={{ base: 4, md: 8 }} py={8}>
          {/* Breadcrumbs */}
          <PropertyBreadcrumbs city={propertyCity} state={propertyState} />

          {/* Main Content Grid */}
          {/* @ts-ignore - Chakra UI Grid type complexity */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            {/* Left Column - Images and Details */}
            <GridItem>
              {/* Image Gallery */}
              <PropertyImageGallery photos={images} propertyId={property.id || externalID} />

              {/* Property Details */}
              <Box mt={6}>
                {/* Price */}
                <Flex alignItems="baseline" justifyContent="space-between" mb={4} gap={3} flexWrap="wrap">
                  <HStack spacing={2} align="baseline">
                    <Text fontSize="3xl" fontWeight="700" fontFamily="'Playfair Display', serif">
                      ₹ {parseFloat(price.replace(/[^0-9.]/g, '') || '0').toLocaleString('en-IN')}
                    </Text>
                    <Icon as={FiInfo} color="gray.500" cursor="pointer" />
                  </HStack>
                  {propertyPrice > 0 && formatPriceInLakhsCrores(propertyPrice) && (
                    <Box
                      px={3}
                      py={1.5}
                      bg="gray.100"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      alignSelf="flex-end"
                    >
                      <Text 
                        fontSize="sm" 
                        fontWeight="600" 
                        color="gray.700"
                        whiteSpace="nowrap"
                      >
                        {formatPriceInLakhsCrores(propertyPrice)}
                      </Text>
                    </Box>
                  )}
                </Flex>

                {/* Property ID and Date Posted */}
                <HStack spacing={4} mb={3} flexWrap="wrap" alignItems="center">
                  {property.property_id && (
                    <Badge colorScheme="teal" fontSize="sm" px={3} py={1.5} borderRadius="md" fontWeight="600">
                      Property ID: {property.property_id}
                    </Badge>
                  )}
                  {property.created_at && (
                    <Text fontSize="sm" color="gray.600">
                      <strong>Date Posted:</strong> {new Date(property.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  )}
                </HStack>
                
                {/* Title, Share and Favorite Buttons */}
                <Flex justify="space-between" align="flex-start" mb={4} gap={4}>
                  <Text
                    fontSize="2xl"
                    fontWeight="600"
                    fontFamily="'Playfair Display', serif"
                    color="gray.800"
                    flex={1}
                  >
                    {title}
                  </Text>
                  <HStack spacing={2}>
                    {/* Share Button - Always visible to all users */}
                    <IconButton
                      aria-label="Share property"
                      icon={<FiShare2 />}
                      size="md"
                      bg="white"
                      color="gray.700"
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="full"
                      _hover={{
                        bg: 'gray.100',
                        transform: 'scale(1.1)',
                      }}
                      onClick={handleShareClick}
                      transition="all 0.2s"
                    />
                    {/* Favorite Button - Only visible when authenticated */}
                    {isAuthenticated && (
                      <IconButton
                        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                        icon={<FiHeart />}
                        size="md"
                        bg={favorite ? 'red.500' : 'white'}
                        color={favorite ? 'white' : 'gray.700'}
                        border="1px solid"
                        borderColor={favorite ? 'red.500' : 'gray.300'}
                        borderRadius="full"
                        _hover={{
                          bg: favorite ? 'red.600' : 'gray.100',
                          transform: 'scale(1.1)',
                        }}
                        onClick={handleFavoriteClick}
                        transition="all 0.2s"
                      />
                    )}
                  </HStack>
                </Flex>

                {/* Lot Size and Location */}
                <HStack spacing={4} mb={4} color="gray.600" fontSize="sm" flexWrap="wrap">
                  {/* For House and Villa: Show Built-up area and Plot area separately */}
                  {isHouseOrVilla ? (
                    <>
                      {sqSize && sqSize !== '0.00' && parseFloat(sqSize) > 0 && (
                        <Text>
                          <strong>Built-up area:</strong> {parseFloat(sqSize) % 1 === 0 
                            ? parseInt(sqSize).toLocaleString('en-IN') 
                            : parseFloat(sqSize).toLocaleString('en-IN', { maximumFractionDigits: 0 })} {areaUnit || 'sq ft'}
                        </Text>
                      )}
                      {hasLandArea && (
                        <Text>
                          <strong>Plot area:</strong> {parseFloat(landArea) % 1 === 0 
                            ? parseInt(landArea).toLocaleString('en-IN') 
                            : parseFloat(landArea).toLocaleString('en-IN', { maximumFractionDigits: 0 })} {landAreaUnit || 'Cent'}
                        </Text>
                      )}
                    </>
                  ) : (
                    /* For other property types: Show regular area and land area if available */
                    <>
                      {lotSize && sqSize && sqSize !== '0.00' && parseFloat(sqSize) > 0 && (
                        <Text>
                          <strong>{lotSize}</strong>
                        </Text>
                      )}
                      {hasLandArea && (
                        <Text>
                          <strong>Land Area:</strong> {parseFloat(landArea) % 1 === 0 
                            ? parseInt(landArea).toLocaleString('en-IN') 
                            : parseFloat(landArea).toLocaleString('en-IN', { maximumFractionDigits: 0 })} {landAreaUnit || 'Cent'}
                        </Text>
                      )}
                    </>
                  )}
                  <HStack spacing={1}>
                    <Icon as={TbMapPin} />
                    <Text>
                      {propertyCity}{propertyState ? `, ${propertyState}` : ''}
                    </Text>
                  </HStack>
                </HStack>

                {/* Engagement Metrics and Dates */}
                <HStack spacing={6} mb={6} fontSize="sm" color="gray.600" flexWrap="wrap">
                  {property.created_at && (
                    <Text>
                      <strong>Posted:</strong> {new Date(property.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  )}
                  {property.updated_at && property.updated_at !== property.created_at && (
                    <Text>
                      <strong>Updated:</strong> {updatedDate}
                    </Text>
                  )}
                  <HStack spacing={1}>
                    <Icon as={TbEye} />
                    <Text>1,722</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={TbHeart} />
                    <Text>118</Text>
                  </HStack>
                </HStack>

                {/* Description */}
                <Box mt={8}>
                  <Text fontSize="lg" fontWeight="600" mb={3} fontFamily="'Playfair Display', serif">
                    Description
                  </Text>
                  {description ? (
                    <Box
                      color="gray.700"
                      lineHeight="1.8"
                      fontSize="md"
                      dangerouslySetInnerHTML={{ __html: description }}
                      sx={{
                        '& p': {
                          marginBottom: '1em',
                          '&:last-child': {
                            marginBottom: 0,
                          },
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          fontWeight: 600,
                          marginTop: '1.5em',
                          marginBottom: '0.5em',
                          fontFamily: "'Playfair Display', serif",
                        },
                        '& ul, & ol': {
                          marginLeft: '1.5em',
                          marginBottom: '1em',
                        },
                        '& li': {
                          marginBottom: '0.5em',
                        },
                        '& a': {
                          color: 'blue.600',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: 'blue.700',
                          },
                        },
                        '& strong, & b': {
                          fontWeight: 600,
                        },
                        '& em, & i': {
                          fontStyle: 'italic',
                        },
                      }}
                    />
                  ) : (
                    <Text color="gray.700" lineHeight="1.8" fontSize="md">
                      No description available.
                    </Text>
                  )}
                </Box>

                {/* Amenities */}
                {amenities && amenities.length > 0 && (
                  <Box mt={8}>
                    <Text fontSize="lg" fontWeight="600" mb={3} fontFamily="'Playfair Display', serif">
                      Amenities
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      {amenities.map((item: string) => (
                        <HStack key={item} spacing={2}>
                          <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Property Stats */}
                <Box mt={8} p={6} bg="gray.50" borderRadius="lg">
                  <SimpleGrid columns={{ base: 2, sm: rooms !== null && baths !== null ? 4 : 3 }} spacing={4}>
                    {rooms !== null && rooms !== undefined && (
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Bedrooms
                        </Text>
                        <Text fontSize="xl" fontWeight="600">
                          {rooms}
                        </Text>
                      </Box>
                    )}
                    {baths !== null && baths !== undefined && (
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Bathrooms
                        </Text>
                        <Text fontSize="xl" fontWeight="600">
                          {baths}
                        </Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Type
                      </Text>
                      <Text fontSize="xl" fontWeight="600">
                        {propertyType || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Status
                      </Text>
                      <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                        {purpose || 'Available'}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Owner Details - Admin Only */}
                {isAdmin && (ownerName || ownerNumber) && (
                  <Box mt={8} p={6} border="2px solid" borderColor="gray.200" borderRadius="lg" bg="white">
                    <HStack spacing={3} mb={4}>
                      <Icon as={FiUser} boxSize={5} color="gray.700" />
                      <Text fontSize="lg" fontWeight="600" fontFamily="'Playfair Display', serif" color="gray.800">
                        Owner Details
                      </Text>
                      <Badge colorScheme="blue" fontSize="xs" ml={2}>
                        Admin Only
                      </Badge>
                    </HStack>
                    <Divider mb={4} />
                    <VStack align="stretch" spacing={3}>
                      {ownerName && (
                        <HStack spacing={3}>
                          <Icon as={FiUser} color="gray.600" />
                          <Box>
                            <Text fontSize="xs" color="gray.600" mb={0.5}>
                              Owner Name
                            </Text>
                            <Text fontSize="md" fontWeight="500" color="gray.900">
                              {ownerName}
                            </Text>
                          </Box>
                        </HStack>
                      )}
                      {ownerNumber && (
                        <HStack spacing={3}>
                          <Icon as={FiPhone} color="gray.600" />
                          <Box>
                            <Text fontSize="xs" color="gray.600" mb={0.5}>
                              Contact Number
                            </Text>
                            <Text fontSize="md" fontWeight="500" color="gray.900">
                              {ownerNumber}
                            </Text>
                          </Box>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>
            </GridItem>

            {/* Right Column - Contact Agent */}
            <GridItem>
              <Box position={{ base: 'static', lg: 'sticky' }} top={8}>
                <ContactAgent propertyTitle={title} />
              </Box>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </DefaultLayout>
  );
};

export default PropertyDetail;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  
  try {
    const property = await getProperty(id!);
    
    // Set cache headers for ISR - reduced cache time to prevent stale data after deletions
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=30'
    );
    
    return {
      props: { property },
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      notFound: true,
    };
  }
};
