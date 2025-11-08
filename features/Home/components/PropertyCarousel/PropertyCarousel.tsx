import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper';
import { Box, IconButton, HStack, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import PropertyCard from '@/features/common/modules/PropertyCard';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';

interface PropertyCarouselProps {
  title: string;
  description?: string;
  properties: any[];
  showViewAll?: boolean;
  viewAllLink?: string;
  autoplay?: boolean;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  title,
  description,
  properties,
  showViewAll = true,
  viewAllLink = '/properties',
  autoplay = true,
}) => {
  const [swiper, setSwiper] = React.useState<any>(null);

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <Box py={12} px={{ base: 4, md: 8 }}>
      <Box maxW="1400px" margin="0 auto">
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={8}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Box>
            <Heading
              size="xl"
              mb={2}
              fontWeight="bold"
              color="gray.800"
            >
              {title}
            </Heading>
            {description && (
              <Text color="gray.600" fontSize="lg" maxW="600px">
                {description}
              </Text>
            )}
          </Box>
          {showViewAll && (
            <HStack spacing={4}>
              <Link href={viewAllLink}>
                <Button variant="ghost" size="sm" colorScheme="blue">
                  View all
                </Button>
              </Link>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => swiper?.slidePrev()}
                />
                <IconButton
                  aria-label="Next"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => swiper?.slideNext()}
                />
              </HStack>
            </HStack>
          )}
        </Flex>

        <Box
          sx={{
            '.property-carousel-swiper': {
              width: '100%',
              '& .swiper-slide': {
                height: 'auto',
                display: 'flex',
              },
            },
          }}
        >
          <Swiper
            onSwiper={setSwiper}
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            autoplay={
              autoplay && properties.length > 1
                ? {
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            loop={properties.length > 5}
            navigation={false}
            className="property-carousel-swiper"
          >
            {properties.map((property, index) => {
              const propertyId = property.id || property.externalID || `property-${index}`;
              return (
                <SwiperSlide key={propertyId} style={{ height: 'auto' }}>
                  <PropertyCard {...property} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyCarousel;

