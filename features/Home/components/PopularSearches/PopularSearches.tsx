import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, HStack, IconButton, SimpleGrid, Text, Link as ChakraLink, Image } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface PopularCategory {
  id: string;
  name: string;
  image: string;
  listingCount: number;
  propertyType: string;
}

const PopularSearches: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [listingCounts, setListingCounts] = useState<Record<string, number>>({});

  // Fetch listing counts for each category
  useEffect(() => {
    const fetchListingCounts = async () => {
      // Map display names to database property types
      const categoryMap: Record<string, string> = {
        'Home': 'House',
        'Land': 'Land',
        'Villas': 'Villa',
        'Flats': 'Flat',
        'Warehouses': 'Warehouse',
        'Commercial Buildings': 'Commercial Building',
      };

      const counts: Record<string, number> = {};

      for (const [displayName, dbPropertyType] of Object.entries(categoryMap)) {
        try {
          const response = await fetch(`/api/get-properties?propertyType=${encodeURIComponent(dbPropertyType)}&status=active&limit=1`);
          const data = await response.json();
          counts[displayName] = data.total || 0;
        } catch (error) {
          console.error(`Error fetching count for ${displayName}:`, error);
          counts[displayName] = 0;
        }
      }

      setListingCounts(counts);
    };

    fetchListingCounts();
  }, []);

  const popularCategories: PopularCategory[] = [
    {
      id: '1',
      name: 'Home',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      listingCount: listingCounts['Home'] || 0,
      propertyType: 'House',
    },
    {
      id: '2',
      name: 'Land',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      listingCount: listingCounts['Land'] || 0,
      propertyType: 'Land',
    },
    {
      id: '3',
      name: 'Villas',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      listingCount: listingCounts['Villas'] || 0,
      propertyType: 'Villa',
    },
    {
      id: '4',
      name: 'Flats',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      listingCount: listingCounts['Flats'] || 0,
      propertyType: 'Flat',
    },
    {
      id: '5',
      name: 'Warehouses',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      listingCount: listingCounts['Warehouses'] || 0,
      propertyType: 'Warehouse',
    },
    {
      id: '6',
      name: 'Commercial Buildings',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      listingCount: listingCounts['Commercial Buildings'] || 0,
      propertyType: 'Commercial Building',
    },
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(popularCategories.length / itemsPerPage);
  const displayedCategories = popularCategories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <Box bg="white" py={16}>
      <Container maxW="container.xl">
        {/* Header */}
        <HStack justify="space-between" align="center" mb={10}>
          <Heading
            as="h2"
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="700"
            fontFamily="'Playfair Display', serif"
            color="gray.900"
          >
            Popular Categories
          </Heading>
          
          <HStack spacing={2}>
            <IconButton
              aria-label="Previous"
              icon={<FiChevronLeft />}
              onClick={handlePrevious}
              isDisabled={currentPage === 0}
              variant="outline"
              borderRadius="full"
              size="lg"
            />
            <IconButton
              aria-label="Next"
              icon={<FiChevronRight />}
              onClick={handleNext}
              isDisabled={currentPage === totalPages - 1}
              variant="outline"
              borderRadius="full"
              size="lg"
            />
          </HStack>
        </HStack>

        {/* Category Cards Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} mb={12}>
          {displayedCategories.map((category) => (
            <ChakraLink
              key={category.id}
              as={Link}
              href={`/properties?propertyType=${encodeURIComponent(category.propertyType)}&status=active`}
              _hover={{ textDecoration: 'none' }}
              display="block"
              width="100%"
            >
              <Box
                position="relative"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.200"
                width="100%"
                sx={{
                  aspectRatio: '4/3',
                  minHeight: { base: '250px', sm: '280px', md: '300px' },
                }}
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                }}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  objectPosition="center"
                  position="absolute"
                  top={0}
                  left={0}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Category+Image';
                  }}
                />
                
                {/* Overlay */}
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                  p={6}
                  color="white"
                >
                  <Text
                    fontSize="lg"
                    fontWeight="700"
                    fontFamily="'Playfair Display', serif"
                    mb={2}
                    color="white"
                  >
                    {category.name}
                  </Text>
                  <HStack spacing={2} align="center">
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      fontFamily="'Inter', sans-serif"
                      color="white"
                    >
                      {category.listingCount.toLocaleString('en-IN')} LISTINGS
                    </Text>
                    <Box color="white">
                      <FiArrowRight size={16} />
                    </Box>
                  </HStack>
                </Box>
              </Box>
            </ChakraLink>
          ))}
        </SimpleGrid>

        {/* View All Button */}
        <Box textAlign="center">
          <ChakraLink
            as={Link}
            href="/properties"
            display="inline-block"
            bg="gray.900"
            color="white"
            px={8}
            py={4}
            borderRadius="md"
            fontWeight="600"
            fontSize="md"
            fontFamily="'Inter', sans-serif"
            _hover={{
              bg: 'gray.800',
              textDecoration: 'none',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.3s"
          >
            View all homes
          </ChakraLink>
        </Box>
      </Container>
    </Box>
  );
};

export default PopularSearches;

