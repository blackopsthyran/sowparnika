import React, { memo } from 'react';
import { usePropertyFormat } from '@/features/common/Hooks/usePropertyFormat';
import { Badge, Box, Flex, HStack, Text, IconButton } from '@chakra-ui/react';
import { TbBed, TbBath, TbRuler } from 'react-icons/tb';
import { FiHeart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import Link from 'next/link';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@chakra-ui/react';
import { FiShare2 } from 'react-icons/fi';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const PropertyCard = memo((property: Object) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const toast = useToast();
  const {
    address,
    coverPhoto,
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
  } = usePropertyFormat(property);

  const propertyId = (property as any).id || externalID;
  const favorite = isFavorite(propertyId);
  const isFeatured = (property as any).featured === true;
  const propertyTypeLower = propertyType?.toLowerCase() || '';
  const isWarehouse = propertyTypeLower === 'warehouse';
  const isHouseOrVilla = propertyTypeLower === 'house' || propertyTypeLower === 'villa';
  
  // Get raw price value for conversion
  const rawPrice = (property as any).price;
  const priceInLakhsCrores = rawPrice ? formatPriceInLakhsCrores(rawPrice) : '';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite(propertyId);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  // Get all images for swiper
  const allImages = photos && Array.isArray(photos) && photos.length > 0
    ? photos.filter((img: string) => img && typeof img === 'string' && img.trim() !== '')
    : [coverPhoto || 'https://placehold.co/800x800/e2e8f0/64748b?text=No+Image'];

  // Fix broken placeholder URLs
  const validImages = allImages.map((img: string) => {
    if (img.includes('via.placeholder.com')) {
      return 'https://placehold.co/800x800/e2e8f0/64748b?text=Property+Image';
    }
    return img;
  });

  const hasMultipleImages = validImages.length > 1;

  return (
    <Box 
      backgroundColor="#fff"
      borderRadius="0" 
      overflow="hidden" 
      boxShadow="md" 
      _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }} 
      transition="all 0.3s"
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      minH={{ base: 'auto', md: '450px' }}
    >
      <Link href={`/properties/${externalID}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Image Container - Fixed Height for Consistent Sizing */}
        <Box
          width="100%"
          height={{ base: '250px', sm: '280px', md: '320px', lg: '340px' }}
          position="relative"
          backgroundColor="gray.200"
          overflow="hidden"
          flexShrink={0}
        >
          {/* Image Swiper */}
          <Box
            position="relative"
            width="100%"
            height="100%"
            sx={{
              '.property-card-swiper': {
                width: '100%',
                height: '100%',
                '& .swiper-wrapper': {
                  height: '100%',
                },
                '& .swiper-slide': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  '& img': {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  },
                },
                '& .swiper-button-next, & .swiper-button-prev': {
                  color: 'white',
                  background: 'rgba(0, 0, 0, 0.6)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  '&:after': {
                    fontSize: '14px',
                    fontWeight: 'bold',
                  },
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.8)',
                  },
                },
                '&:hover .swiper-button-next, &:hover .swiper-button-prev': {
                  opacity: 1,
                },
                '& .swiper-pagination': {
                  bottom: '10px',
                },
                '& .swiper-pagination-bullet': {
                  background: 'white',
                  opacity: 0.6,
                  width: '8px',
                  height: '8px',
                  '&.swiper-pagination-bullet-active': {
                    opacity: 1,
                    background: 'white',
                  },
                },
              },
            }}
          >
            <Swiper
              modules={hasMultipleImages ? [Navigation, Pagination] : []}
              navigation={hasMultipleImages}
              pagination={hasMultipleImages ? { clickable: true, dynamicBullets: true } : false}
              className="property-card-swiper"
              loop={false}
              spaceBetween={0}
            >
              {validImages.map((image: string, index: number) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <OptimizedImage
                    src={image}
                    alt={`${title || 'Property'} - Image ${index + 1}`}
                    width={800}
                    height={600}
                    priority={index === 0}
                    quality={index === 0 ? 85 : 75}
                    breakpoint="card"
                    fill
                    objectFit="cover"
                    onError={(e) => {
                      console.error('Image failed to load:', image);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* Badge Overlay */}
          <Box
            position="absolute"
            top="1rem"
            left="1rem"
            zIndex={2}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {isFeatured && (
              <Badge 
                bg="warm.500" 
                color="white" 
                fontSize="xs" 
                px={2} 
                py={1} 
                borderRadius="0"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.05em"
                boxShadow="0 2px 8px rgba(245, 158, 11, 0.4)"
              >
                Featured
              </Badge>
            )}
            <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="0">
              {purpose}
            </Badge>
          </Box>

          {/* Favorite and Share Buttons */}
          <Box
            position="absolute"
            top="1rem"
            right="1rem"
            zIndex={2}
            display="flex"
            gap={2}
          >
            {/* Share Button - Always visible to all users */}
            <IconButton
              aria-label="Share property"
              icon={<FiShare2 />}
              size="sm"
              bg="white"
              color="gray.700"
              borderRadius="full"
              _hover={{
                bg: 'gray.100',
                transform: 'scale(1.1)',
              }}
              onClick={handleShareClick}
              transition="all 0.2s"
              boxShadow="md"
            />
            {/* Favorite Button - Only visible when authenticated */}
            {isAuthenticated && (
              <IconButton
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                icon={<FiHeart />}
                size="sm"
                bg={favorite ? 'red.500' : 'white'}
                color={favorite ? 'white' : 'gray.700'}
                borderRadius="full"
                _hover={{
                  bg: favorite ? 'red.600' : 'gray.100',
                  transform: 'scale(1.1)',
                }}
                onClick={handleFavoriteClick}
                transition="all 0.2s"
                boxShadow="md"
              />
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box 
          padding={{ base: '0.875rem', md: '1rem' }}
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          minH={{ base: 'auto', md: 'auto' }}
          gap={{ base: 2, md: 2.5 }}
        >
          {/* Price */}
          <Flex alignItems="center" justifyContent="space-between" gap={2}>
            <Text 
              fontSize="xl" 
              fontWeight="700" 
              color="gray.900" 
              fontFamily="'Playfair Display', serif" 
              lineHeight="shorter"
              noOfLines={1}
              flex="1"
            >
              {price || 'Price on request'}
            </Text>
            {priceInLakhsCrores && (
              <Box
                px={2}
                py={1}
                bg="gray.100"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text 
                  fontSize="xs" 
                  fontWeight="600" 
                  color="gray.700"
                  whiteSpace="nowrap"
                >
                  {priceInLakhsCrores}
                </Text>
              </Box>
            )}
          </Flex>

          {/* Title */}
          {title && (
            <Text 
              fontWeight="600" 
              fontSize="md" 
              color="gray.800" 
              noOfLines={2}
              lineHeight="1.4"
              fontFamily="'Playfair Display', serif"
            >
              {title}
            </Text>
          )}

          {/* Location */}
          {address && (
            <Text 
              fontWeight="400" 
              fontSize="sm" 
              color="gray.600" 
              noOfLines={2}
              lineHeight="1.4"
              minH="auto"
            >
              {address}
            </Text>
          )}

          {/* Property Features - Bedrooms, Bathrooms (if applicable), Square Footage */}
          <HStack 
            spacing={4} 
            color="gray.600" 
            fontSize="sm" 
            fontWeight="500"
            mt={2}
            pt={1}
            flexWrap="wrap"
          >
            {rooms !== null && rooms !== undefined && (
              <Flex alignItems="center" gap={1.5}>
                <TbBed size={16} />
                <Text>{rooms}</Text>
              </Flex>
            )}
            {baths !== null && baths !== undefined && (
              <Flex alignItems="center" gap={1.5}>
                <TbBath size={16} />
                <Text>{baths}</Text>
              </Flex>
            )}
            {/* Show area - land area is shown on property details page, not on tile */}
            {sqSize && sqSize !== '0.00' && parseFloat(sqSize) > 0 && (
              <Flex alignItems="center" gap={1.5}>
                <TbRuler size={16} />
                <Text>
                  {parseFloat(sqSize) % 1 === 0 
                    ? parseInt(sqSize).toLocaleString('en-IN') 
                    : parseFloat(sqSize).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                <Text as="span" fontSize="xs">{areaUnit || 'sq ft'}</Text>
              </Flex>
            )}
          </HStack>
        </Box>
      </Link>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  const prev = prevProps as any;
  const next = nextProps as any;
  
  // Compare by ID
  const prevId = prev.id || prev.externalID;
  const nextId = next.id || next.externalID;
  
  if (prevId !== nextId) return false;
  
  // Compare featured status
  if (prev.featured !== next.featured) return false;
  
  // Compare images array length
  const prevImages = Array.isArray(prev.images) ? prev.images : [];
  const nextImages = Array.isArray(next.images) ? next.images : [];
  if (prevImages.length !== nextImages.length) return false;
  
  return true;
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
