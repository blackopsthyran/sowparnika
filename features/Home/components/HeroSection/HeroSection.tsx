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
  const [bhk, setBhk] = useState('');
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
    
    // Add search query if provided (supports title, address, city, property ID search)
    // Also supports special plot/land search logic handled by API
    if (searchQuery && searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    // Add BHK filter if selected
    if (bhk) {
      params.append('bhk', bhk);
    }
    
    // Add price range filters if set and not default values
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      const minNum = parseInt(min) || 0;
      const maxNum = parseInt(max) || 10000000;
      
      // Only add minPrice if it's not 0
      if (minNum > 0) {
        params.append('minPrice', minNum.toString());
      }
      
      // Only add maxPrice if it's not the default max (10,000,000)
      if (maxNum < 10000000) {
        params.append('maxPrice', maxNum.toString());
      }
    }
    
    // Always show active properties
    params.append('status', 'active');
    
    // Navigate to properties page with filters
    const queryString = params.toString();
    router.push(`/properties${queryString ? `?${queryString}` : ''}`);
  };
  
  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
      <Box
        position="relative"
        h={{ base: '70vh', md: '75vh', lg: '80vh' }}
        minH={{ base: '500px', md: '600px', lg: '650px' }}
        maxH={{ base: '700px', md: '800px', lg: '900px' }}
        pt={{ base: '70px', md: '80px', lg: '90px' }}
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
      <Container 
        maxW="container.xl" 
        position="relative" 
        zIndex={1}
        px={{ base: 4, md: 6, lg: 8 }}
        w="100%"
      >
        <VStack spacing={8} color="white" textAlign="center" w="100%">
          <VStack spacing={4} w="100%">
            <Heading
              fontWeight="700"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl', xl: '6xl' }}
              lineHeight="shorter"
              fontFamily="'Playfair Display', serif"
              letterSpacing="-0.02em"
              color="white"
              px={{ base: 4, md: 6, lg: 8 }}
            >
              Explore Kerala's Most Exquisite Luxury Properties
            </Heading>
            <Text 
              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
              maxW={{ base: '90%', md: '800px', lg: '900px' }} 
              opacity={0.9} 
              color="white"
              px={{ base: 4, md: 6, lg: 8 }}
            >
              Discover luxury homes, mansions, and villas for sale in Kerala in one simple search
            </Text>
          </VStack>

          {/* Search Bar */}
          <Box
            w="100%"
            maxW={{ base: '100%', md: '900px', lg: '1100px' }}
            mx="auto"
            bg="rgba(250, 248, 245, 0.95)"
            backdropFilter="blur(24px) saturate(200%)"
            borderRadius="full"
            p={{ base: 1, md: 1.5, lg: 2 }}
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            border="1px solid rgba(220, 215, 210, 0.6)"
            position="relative"
            px={{ base: 2, md: 4, lg: 6 }}
            sx={{
              '@media (max-width: 767px)': {
                p: '1px',
                borderRadius: 'full',
              },
            }}
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
              h={{ base: '40px', md: '48px', lg: '52px' }}
              w="100%"
              overflow="hidden"
            >
              {/* Location Input */}
              <HStack 
                flex={{ base: '1 1 0', md: '1 1 0' }}
                minW={0}
                spacing={{ base: 2, md: 3.5, lg: 4 }}
                px={{ base: 3, md: 4, lg: 5 }}
                h="full"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
                flexShrink={1}
              >
                <Box 
                  color="gray.700" 
                  sx={{ '& svg': { strokeWidth: '2.5', width: { base: '18px', md: '20px' }, height: { base: '18px', md: '20px' } } }} 
                  flexShrink={0}
                >
                  <FiMapPin size={20} />
                </Box>
                <Input
                  placeholder="Search by title, address, city, or property ID (e.g., SP1)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  color="gray.900"
                  fontSize={{ base: '13px', md: '15px' }}
                  bg="transparent"
                  _placeholder={{ color: 'gray.500', fontFamily: "'Playfair Display', serif", fontSize: { base: '13px', md: '15px' } }}
                  px={0}
                  h="auto"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="500"
                  letterSpacing="0.01em"
                  flex={1}
                  minW={0}
                />
              </HStack>
              
              {/* Price Dropdown */}
              <Box 
                position="relative"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
                minW={{ base: '80px', md: '180px', lg: '200px' }}
                maxW={{ base: '100px', md: '180px', lg: '200px' }}
                w={{ base: '80px', md: 'auto' }}
                h="full"
                flexShrink={0}
                sx={{
                  '& > div': {
                    bg: 'transparent !important',
                    border: 'none !important',
                    borderRadius: '0 !important',
                    boxShadow: 'none !important',
                    w: '100%',
                    h: 'full',
                    '& > button': {
                      bg: 'transparent !important',
                      border: 'none !important',
                      borderRadius: '0 !important',
                      boxShadow: 'none !important',
                      h: 'full',
                      py: 0,
                      px: { base: 2, md: 5 },
                      _hover: {
                        bg: 'rgba(0, 0, 0, 0.03) !important',
                      },
                      transition: 'all 0.2s ease',
                      fontSize: { base: '11px', md: '15px' },
                      '& > div': {
                        fontSize: { base: '11px', md: '15px' },
                      }
                    }
                  }
                }}
              >
                <PriceRangeSelector
                  value={priceRange}
                  onChange={setPriceRange}
                  maxW="100%"
                />
              </Box>
              
              {/* Beds Dropdown */}
              <Box 
                position="relative"
                borderRight="1px solid rgba(0, 0, 0, 0.06)"
                minW={{ base: '75px', md: '150px', lg: '160px' }}
                maxW={{ base: '90px', md: '150px', lg: '160px' }}
                w={{ base: '75px', md: 'auto' }}
                h="full"
                flexShrink={0}
                sx={{
                  '& > div': {
                    bg: 'transparent !important',
                    border: 'none !important',
                    borderRadius: '0 !important',
                    boxShadow: 'none !important',
                    w: '100%',
                    h: 'full',
                    '& > button': {
                      bg: 'transparent !important',
                      border: 'none !important',
                      borderRadius: '0 !important',
                      boxShadow: 'none !important',
                      h: 'full',
                      py: 0,
                      px: { base: 2, md: 5 },
                      _hover: {
                        bg: 'rgba(0, 0, 0, 0.03) !important',
                      },
                      transition: 'all 0.2s ease',
                      fontSize: { base: '11px', md: '15px' },
                      '& > div': {
                        fontSize: { base: '11px', md: '15px' },
                      }
                    }
                  }
                }}
              >
                <SleekDropdown
                  placeholder="Any BHK"
                  value={bhk}
                  onChange={setBhk}
                  maxW="100%"
                  options={[
                    { value: '', label: 'Any BHK' },
                    { value: '1', label: '1+' },
                    { value: '2', label: '2+' },
                    { value: '3', label: '3+' },
                    { value: '4', label: '4+' },
                    { value: '5', label: '5+' },
                  ]}
                /> 
              </Box>
              
              {/* Search Button */}
              <Button
                bg="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                color="white"
                px={{ base: 4, md: 8, lg: 10 }}
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
                ml={{ base: 2, md: 3, lg: 4 }}
                flexShrink={0}
                fontSize={{ base: '13px', md: '15px', lg: '16px' }}
                fontFamily="'Playfair Display', serif"
                letterSpacing="0.02em"
                boxShadow="0 4px 12px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                textTransform="none"
                minW={{ base: '80px', md: '130px', lg: '140px' }}
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

