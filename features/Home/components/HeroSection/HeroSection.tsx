import React, { useState } from 'react';
import { Box, Container, VStack, Heading, Text, HStack, Input, Button, Flex } from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/router';
import SleekDropdown from '@/features/Home/components/SleekDropdown/SleekDropdown';
import PriceRangeSelector from '@/features/Home/components/PriceRangeSelector/PriceRangeSelector';

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');

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
      minH="100vh"
      pt="80px"
      backgroundImage="url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')"
      backgroundPosition="center"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.500"
        backdropFilter="blur(2px)"
      />

      {/* Content */}
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={8} color="white" textAlign="center">
          <VStack spacing={4}>
            <Heading
              size="2xl"
              fontWeight="700"
              fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
              lineHeight="shorter"
              fontFamily="'Playfair Display', serif"
              letterSpacing="-0.02em"
            >
              Explore the World's Finest Properties
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} maxW="800px" opacity={0.9}>
              Discover luxury homes, mansions, and villas for sale worldwide in one simple search
            </Text>
          </VStack>

          {/* Search Bar */}
          <Box
            w="full"
            maxW="900px"
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(20px) saturate(180%)"
            borderRadius="xl"
            p={3}
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset"
            border="1px solid rgba(255, 255, 255, 0.3)"
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={3}
              align="stretch"
            >
              <HStack 
                flex={1} 
                spacing={3}
                bg="rgba(255, 255, 255, 0.8)"
                borderRadius="lg"
                px={4}
                py={2}
                border="1px solid rgba(255, 255, 255, 0.3)"
              >
                <FiMapPin color="gray" size={18} />
                <Input
                  placeholder="City, Region, Country"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  color="gray.800"
                  fontSize="sm"
                  bg="transparent"
                  _placeholder={{ color: 'gray.500' }}
                />
              </HStack>
              
              <PriceRangeSelector
                value={priceRange}
                onChange={setPriceRange}
                maxW={{ base: 'full', md: '220px' }}
              />
              
              <SleekDropdown
                placeholder="Any beds"
                value={propertyType}
                onChange={setPropertyType}
                maxW={{ base: 'full', md: '180px' }}
                icon={<FiHome />}
                options={[
                  { value: '', label: 'Any beds' },
                  { value: '1', label: '1+ Beds' },
                  { value: '2', label: '2+ Beds' },
                  { value: '3', label: '3+ Beds' },
                  { value: '4', label: '4+ Beds' },
                  { value: '5', label: '5+ Beds' },
                ]}
              />
              
              <Button
                bg="teal.500"
                color="white"
                size="lg"
                borderRadius="lg"
                px={8}
                leftIcon={<FiSearch />}
                onClick={handleSearch}
                w={{ base: 'full', md: 'auto' }}
                _hover={{
                  bg: 'teal.600',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                transition="all 0.2s"
                fontWeight="600"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
              >
                Search
              </Button>
            </Flex>
          </Box>

          <Text fontSize="sm" opacity={0.8}>
            EXPLORE 520,000+ HOMES, MANSIONS AND VILLAS FOR SALE WORLDWIDE
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default HeroSection;

