import React, { useState } from 'react';
import { Box, Container, VStack, Heading, Text, HStack, Input, Button, Flex } from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import SleekDropdown from '@/features/Home/components/SleekDropdown/SleekDropdown';
import PriceRangeSelector from '@/features/Home/components/PriceRangeSelector/PriceRangeSelector';

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Background images for carousel
  const backgroundImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // Tea plantation
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80', // Luxury villa
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80', // Modern house
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80', // Luxury estate
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80', // Mansion
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (propertyType) {
      params.append('bhk', propertyType);
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min && min !== '0') {
        params.append('minPrice', min);
      }
      if (max && max !== '10000000') {
        params.append('maxPrice', max);
      }
    }
    // Always show active properties
    params.append('status', 'active');
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <Box
      position="relative"
      h="75vh"
      minH="75vh"
      pt="80px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderBottomLeftRadius="2xl"
      borderBottomRightRadius="2xl"
      overflow="hidden"
    >
      {/* Background Carousel */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        borderBottomLeftRadius="2xl"
        borderBottomRightRadius="2xl"
        overflow="hidden"
        sx={{
          '& .hero-background-carousel': {
            width: '100%',
            height: '100%',
            '& .swiper-wrapper': {
              height: '100%',
            },
            '& .swiper-slide': {
              height: '100%',
            },
          },
        }}
      >
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={1500}
          className="hero-background-carousel"
        >
          {backgroundImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                w="100%"
                h="100%"
                backgroundImage={`url(${image})`}
                backgroundPosition="center"
                backgroundSize="cover"
                backgroundAttachment="fixed"
                backgroundRepeat="no-repeat"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.400"
        borderBottomLeftRadius="2xl"
        borderBottomRightRadius="2xl"
        zIndex={1}
      />

      {/* Content */}
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={8} color="white" textAlign="center">
          <VStack spacing={4}>
            <Heading
              fontWeight="700"
              fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
              lineHeight="shorter"
              fontFamily="'Playfair Display', serif"
              letterSpacing="-0.02em"
              color="white"
            >
              Explore Kerala's Most Exquisite Luxury Properties
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} maxW="800px" opacity={0.9} color="white">
              Discover luxury homes, mansions, and villas for sale in Kerala in one simple search
            </Text>
          </VStack>

          {/* Search Bar */}
          <Box
            w="full"
            maxW="1100px"
            bg="rgba(250, 248, 245, 0.95)"
            backdropFilter="blur(24px) saturate(200%)"
            borderRadius="full"
            p={1.5}
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            border="1px solid rgba(220, 215, 210, 0.6)"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'full',
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          >
            <Flex
              direction="row"
              align="center"
              gap={0}
              h="44px"
            >
              {/* Location Input */}
              <HStack 
                flex={1} 
                spacing={3.5}
                px={5}
                h="full"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
              >
                <Box color="gray.700" sx={{ '& svg': { strokeWidth: '2.5' } }}>
                  <FiMapPin size={20} />
                </Box>
                <Input
                  placeholder="City, Region, Country"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  color="gray.900"
                  fontSize="15px"
                  bg="transparent"
                  _placeholder={{ color: 'gray.500', fontFamily: "'Playfair Display', serif" }}
                  px={0}
                  h="auto"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="500"
                  letterSpacing="0.01em"
                />
              </HStack>
              
              {/* Price Dropdown */}
              <Box 
                position="relative"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
                minW="200px"
                h="full"
                sx={{
                  '& > div': {
                    bg: 'transparent !important',
                    border: 'none !important',
                    borderRadius: '0 !important',
                    boxShadow: 'none !important',
                    w: 'full',
                    h: 'full',
                    '& > button': {
                      bg: 'transparent !important',
                      border: 'none !important',
                      borderRadius: '0 !important',
                      boxShadow: 'none !important',
                      h: 'full',
                      py: 0,
                      px: 5,
                      _hover: {
                        bg: 'rgba(0, 0, 0, 0.03) !important',
                      },
                      transition: 'all 0.2s ease'
                    }
                  }
                }}
              >
                <PriceRangeSelector
                  value={priceRange}
                  onChange={setPriceRange}
                  maxW="200px"
                />
              </Box>
              
              {/* Beds Dropdown */}
              <Box 
                position="relative"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
                minW="160px"
                h="full"
                sx={{
                  '& > div': {
                    bg: 'transparent !important',
                    border: 'none !important',
                    borderRadius: '0 !important',
                    boxShadow: 'none !important',
                    w: 'full',
                    h: 'full',
                    '& > button': {
                      bg: 'transparent !important',
                      border: 'none !important',
                      borderRadius: '0 !important',
                      boxShadow: 'none !important',
                      h: 'full',
                      py: 0,
                      px: 5,
                      _hover: {
                        bg: 'rgba(0, 0, 0, 0.03) !important',
                      },
                      transition: 'all 0.2s ease'
                    }
                  }
                }}
              >
                <SleekDropdown
                  placeholder="Any beds"
                  value={propertyType}
                  onChange={setPropertyType}
                  maxW="160px"
                  options={[
                    { value: '', label: 'Any beds' },
                    { value: '1', label: '1+ Beds' },
                    { value: '2', label: '2+ Beds' },
                    { value: '3', label: '3+ Beds' },
                    { value: '4', label: '4+ Beds' },
                    { value: '5', label: '5+ Beds' },
                  ]}
                /> 
              </Box>
              
              {/* Search Button */}
              <Button
                bg="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                color="white"
                px={10}
                h="full"
                borderRadius="full"
                onClick={handleSearch}
                _hover={{
                  bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 24px rgba(20, 184, 166, 0.4)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                fontWeight="600"
                ml={3}
                flexShrink={0}
                fontSize="15px"
                fontFamily="'Playfair Display', serif"
                letterSpacing="0.02em"
                boxShadow="0 4px 12px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                textTransform="none"
                minW="140px"
              >
                Search
              </Button>
            </Flex>
          </Box>

          <Text fontSize="sm" opacity={0.8} color="white">
            EXPLORE 520,000+ HOMES, MANSIONS AND VILLAS FOR SALE IN KERALA
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default HeroSection;

