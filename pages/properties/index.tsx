import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  SimpleGrid,
  Input,
  Select,
  HStack,
  VStack,
  Button,
  Text,
  Container,
  InputGroup,
  InputLeftElement,
  Flex,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import PropertyCard from '@/features/common/modules/PropertyCard';

interface Property {
  id: string;
  title: string;
  property_type: string;
  bhk: number;
  selling_type: string;
  price: number;
  area_size: number;
  area_unit: string;
  city: string;
  address: string;
  images: string[];
  status: string;
  [key: string]: any;
}

const Properties = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    sellingType: '',
    city: '',
    bhk: '',
    status: 'active',
    minPrice: '',
    maxPrice: '',
  });
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [total, setTotal] = useState(0);

  // Read URL parameters on initial mount only
  const [urlParamsRead, setUrlParamsRead] = useState(false);
  
  useEffect(() => {
    if (router.isReady && !urlParamsRead) {
      const { search, bhk, minPrice, maxPrice, propertyType, city, status } = router.query;
      
      if (search && typeof search === 'string') {
        setSearchQuery(search);
      }
      
      if (bhk && typeof bhk === 'string') {
        setFilters(prev => ({ ...prev, bhk }));
      }
      
      if (minPrice && typeof minPrice === 'string') {
        setFilters(prev => ({ ...prev, minPrice }));
      }
      
      if (maxPrice && typeof maxPrice === 'string') {
        setFilters(prev => ({ ...prev, maxPrice }));
      }
      
      if (propertyType && typeof propertyType === 'string') {
        setFilters(prev => ({ ...prev, propertyType }));
      }
      
      if (city && typeof city === 'string') {
        setFilters(prev => ({ ...prev, city }));
      }
      
      if (status && typeof status === 'string') {
        setFilters(prev => ({ ...prev, status }));
      }
      
      setUrlParamsRead(true);
    }
  }, [router.isReady, router.query, urlParamsRead]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change (without page reload)
  useEffect(() => {
    if (router.isReady) {
      const params = new URLSearchParams();
      
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.sellingType) params.append('sellingType', filters.sellingType);
      if (filters.city) params.append('city', filters.city);
      if (filters.bhk) params.append('bhk', filters.bhk);
      if (filters.status) params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (sortBy !== 'created_at') params.append('sortBy', sortBy);
      if (sortOrder !== 'desc') params.append('sortOrder', sortOrder);

      // Update URL without page reload
      const newUrl = params.toString() 
        ? `/properties?${params.toString()}`
        : '/properties';
      
      router.replace(newUrl, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters, sortBy, sortOrder, router.isReady]);

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        sortBy,
        sortOrder,
        limit: '50',
      });

      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.sellingType) params.append('sellingType', filters.sellingType);
      if (filters.city) params.append('city', filters.city);
      if (filters.bhk) params.append('bhk', filters.bhk);
      if (filters.status) params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await fetch(`/api/get-properties?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const propertiesData = data.properties || [];
        // Debug: Log first property's images
        if (propertiesData.length > 0 && process.env.NODE_ENV === 'development') {
          console.log('First property images:', propertiesData[0].images);
          console.log('First property:', propertiesData[0]);
        }
        setProperties(propertiesData);
        setTotal(data.total || 0);
      } else {
        console.error('Error fetching properties:', data.error);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    properties.forEach((p) => {
      if (p.city) cities.add(p.city);
    });
    return Array.from(cities).sort();
  }, [properties]);

  const uniquePropertyTypes = useMemo(() => {
    const types = new Set<string>();
    properties.forEach((p) => {
      if (p.property_type) types.add(p.property_type);
    });
    return Array.from(types).sort();
  }, [properties]);

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      sellingType: '',
      city: '',
      bhk: '',
      status: 'active',
      minPrice: '',
      maxPrice: '',
    });
    setSearchQuery('');
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'active'
  ) || searchQuery !== '';

  // Transform database properties to match PropertyCard format
  // The usePropertyFormat hook will handle the transformation, so we just need to pass the raw property
  const transformedProperties = properties.map((property) => ({
    ...property,
    // Ensure images array exists
    images: property.images || [],
  }));

  return (
    <DefaultLayout
      title="Properties"
      description="Find your dream home with our real estate website. Browse through thousands of listings."
    >
      <Box backgroundColor="#f7f8f9" minH="100vh" py="3rem">
        <Container maxW="1400px">
          {/* Search and Filter Bar */}
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="md"
            mb={8}
          >
            <VStack spacing={4} align="stretch">
              {/* Search Bar */}
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Search by title, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="lg"
                />
              </InputGroup>

              {/* Quick Filters */}
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <Select
                  placeholder="All Property Types"
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({ ...filters, propertyType: e.target.value })
                  }
                  borderRadius="lg"
                >
                  {uniquePropertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Sale or Rent"
                  value={filters.sellingType}
                  onChange={(e) =>
                    setFilters({ ...filters, sellingType: e.target.value })
                  }
                  borderRadius="lg"
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                </Select>

                <Select
                  placeholder="All Cities"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  borderRadius="lg"
                >
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>

                <HStack>
                  <Select
                    placeholder="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    borderRadius="lg"
                    flex={1}
                  >
                    <option value="created_at">Newest First</option>
                    <option value="price">Price</option>
                    <option value="area_size">Area Size</option>
                    <option value="title">Title</option>
                  </Select>
                  <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    variant="outline"
                    size="md"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </HStack>
              </SimpleGrid>

              {/* Active Filters and Clear */}
              {hasActiveFilters && (
                <Flex wrap="wrap" gap={2} align="center">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Active Filters:
                  </Text>
                  {filters.propertyType && (
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                      {filters.propertyType}
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        ml={2}
                        variant="ghost"
                        onClick={() =>
                          setFilters({ ...filters, propertyType: '' })
                        }
                      />
                    </Badge>
                  )}
                  {filters.sellingType && (
                    <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                      {filters.sellingType}
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        ml={2}
                        variant="ghost"
                        onClick={() =>
                          setFilters({ ...filters, sellingType: '' })
                        }
                      />
                    </Badge>
                  )}
                  {filters.city && (
                    <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                      {filters.city}
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        ml={2}
                        variant="ghost"
                        onClick={() => setFilters({ ...filters, city: '' })}
                      />
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={clearFilters}
                    leftIcon={<FiX />}
                  >
                    Clear All
                  </Button>
                </Flex>
              )}

              {/* Results Count */}
              <Text fontSize="sm" color="gray.600">
                {loading ? 'Loading...' : `Found ${total} propert${total !== 1 ? 'ies' : 'y'}`}
              </Text>
            </VStack>
          </Box>

          {/* Properties Grid */}
          {loading ? (
            <Box textAlign="center" py={20}>
              <Text fontSize="xl" color="gray.500">
                Loading properties...
              </Text>
            </Box>
          ) : properties.length === 0 ? (
            <Box
              textAlign="center"
              py={20}
              bg="white"
              borderRadius="xl"
              boxShadow="md"
            >
              <Text fontSize="xl" color="gray.500" mb={4}>
                No properties found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search or filters
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={8}>
              {transformedProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default Properties;
