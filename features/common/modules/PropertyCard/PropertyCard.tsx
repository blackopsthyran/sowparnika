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
    externalID,
    photos,
  } = usePropertyFormat(property);

  // Get all images for swiper
  const allImages = photos && Array.isArray(photos) && photos.length > 0
    ? photos.filter((img: string) => img && typeof img === 'string' && img.trim() !== '')
    : [coverPhoto || 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image'];

  // Fix broken placeholder URLs
  const validImages = allImages.map((img: string) => {
    if (img.includes('via.placeholder.com')) {
      return 'https://placehold.co/800x600/e2e8f0/64748b?text=Property+Image';
    }
    return img;
  });

  const hasMultipleImages = validImages.length > 1;

  return (
    <Box marginBottom="4rem" backgroundColor="#fff" borderRadius="lg" overflow="hidden" boxShadow="md" _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
      <Link href={`/properties/${externalID}`}>
        <Box
          as="div"
          height="250px"
          position="relative"
          backgroundColor="gray.200"
          overflow="hidden"
        >
          {/* Image Swiper */}
          <Box
            position="relative"
            sx={{
              '.property-card-swiper': {
                width: '100%',
                height: '100%',
                '& .swiper-slide': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& img': {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Available';
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
            <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="md">
              {purpose}
            </Badge>
          </Box>
        </Box>

        {/* Content Section */}
        <Box padding="1.5rem">
          {/* Price - Now in text section */}
          <Text fontSize="2xl" fontWeight="700" marginBottom="0.5rem" color="blue.600" fontFamily="'Playfair Display', serif">
            {price || 'Price on request'}
          </Text>

          {/* Property Type */}
          <Text fontSize="lg" fontWeight="600" marginBottom="0.5rem" color="gray.800">
            {propertyType}
          </Text>

          {/* Title */}
          <Text fontWeight="500" fontSize="md" marginBottom="0.5rem" isTruncated color="gray.700">
            {title}
          </Text>

          {/* Address */}
          <Text fontWeight="light" fontSize="sm" color="gray.600" marginBottom="1rem" isTruncated>
            {address}
          </Text>

          {/* Property Features */}
          <HStack spacing="1.3rem" marginTop="1rem" color="gray.600">
            <Flex alignItems="center" gap="0.3rem" fontSize="sm">
              <TbBed />
              <Text>{rooms}</Text>
            </Flex>
            <Flex alignItems="center" gap="0.3rem" fontSize="sm">
              <TbBath />
              <Text>{baths}</Text>
            </Flex>
            <Flex alignItems="center" gap="0.3rem" fontSize="sm">
              <TbRuler />
              <Text>{sqSize}</Text>
              <Text as="sup" fontSize="xs">m2</Text>
            </Flex>
          </HStack>
        </Box>
      </Link>
    </Box>
  );
};

export default PropertyCard;
