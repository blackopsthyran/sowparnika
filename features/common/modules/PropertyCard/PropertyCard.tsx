import React from 'react';
import { usePropertyFormat } from '@/features/common/Hooks/usePropertyFormat';
import { Badge, Box, Flex, HStack, Text } from '@chakra-ui/react';
import { TbBed, TbBath, TbRuler } from 'react-icons/tb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PropertyCard = (property: Object) => {
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
    externalID,
    photos,
  } = usePropertyFormat(property);

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
          height={{ base: '250px', sm: '280px', md: '300px' }}
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
              loop={hasMultipleImages && validImages.length > 1}
              spaceBetween={0}
            >
              {validImages.map((image: string, index: number) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <Box
                    as="img"
                    src={image}
                    alt={`${title || 'Property'} - Image ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/e2e8f0/64748b?text=Image+Not+Available';
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
          >
            <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="0">
              {purpose}
            </Badge>
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
          <Text 
            fontSize="xl" 
            fontWeight="700" 
            color="gray.900" 
            fontFamily="'Playfair Display', serif" 
            lineHeight="shorter"
            noOfLines={1}
          >
            {price || 'Price on request'}
          </Text>

          {/* Location */}
          <Text 
            fontWeight="400" 
            fontSize="sm" 
            color="gray.600" 
            noOfLines={2}
            lineHeight="1.4"
            minH="auto"
          >
            {address || title}
          </Text>

          {/* Property Features - Bedrooms, Bathrooms (if applicable), Square Footage */}
          <HStack 
            spacing={4} 
            color="gray.600" 
            fontSize="sm" 
            fontWeight="500"
            mt={2}
            pt={1}
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
            <Flex alignItems="center" gap={1.5}>
              <TbRuler size={16} />
              <Text>
                {sqSize && sqSize !== '0.00' 
                  ? (parseFloat(sqSize) % 1 === 0 
                      ? parseInt(sqSize).toLocaleString('en-IN') 
                      : parseFloat(sqSize).toLocaleString('en-IN', { maximumFractionDigits: 0 }))
                  : '0'}
              </Text>
              <Text as="span" fontSize="xs">{areaUnit || 'sq ft'}</Text>
            </Flex>
          </HStack>
        </Box>
      </Link>
    </Box>
  );
};

export default PropertyCard;
