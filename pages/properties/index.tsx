import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  SimpleGrid,
  Input,
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
  Icon,
  Divider,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch, FiX, FiHome, FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import PropertyCard from '@/features/common/modules/PropertyCard';
import SleekDropdown from '@/features/Home/components/SleekDropdown/SleekDropdown';
import PriceRangeSelector from '@/features/Home/components/PriceRangeSelector/PriceRangeSelector';
import Link from 'next/link';

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
  const [priceRange, setPriceRange] = useState([0, 20000000]); // Max 2 Crore
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const propertiesPerPage = 9;
  
  // Mobile filters collapse state
  const { isOpen: isFiltersOpen, onToggle: onToggleFilters } = useDisclosure();
  
  // Track if we've initialized from URL to prevent premature fetching
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);
  const processingQueryRef = useRef<string>('');
  // Store current filters in a ref for synchronous access during fetch
  const filtersRef = useRef(filters);
  const searchQueryRef = useRef(searchQuery);

  // Keep refs in sync with state
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Read URL parameters whenever router query changes
  // Use useLayoutEffect to ensure this runs synchronously before paint
  // This MUST run before fetchProperties to ensure filters are set correctly
  useLayoutEffect(() => {
    if (!router.isReady) {
      // If router is not ready, mark as not initialized to prevent fetching
      setHasInitializedFromUrl(false);
      return;
    }
    
    // Create a stable query signature from router.query (excluding page)
    const querySig = [
      router.query.propertyType || '',
      router.query.search || '',
      router.query.city || '',
      router.query.bhk || '',
      router.query.sellingType || '',
      router.query.status || 'active',
      router.query.featured || '',
      router.query.minPrice || '',
      router.query.maxPrice || '',
      router.query.sortBy || 'created_at',
      router.query.sortOrder || 'desc',
    ].join('|');
    
    // Skip if we're already processing this exact query
    if (processingQueryRef.current === querySig) {
      // But ensure we're marked as initialized and read page from URL
      if (!hasInitializedFromUrl) {
        const urlPage = router.query.page ? parseInt(router.query.page as string) : 1;
        setCurrentPage(urlPage || 1);
        setHasInitializedFromUrl(true);
      }
      return;
    }
    
    processingQueryRef.current = querySig;
    setIsUpdatingFromUrl(true);
    setHasInitializedFromUrl(false);
    setLoading(true); // Show loading immediately
    setProperties([]); // Clear properties immediately to prevent glitch
    setTotal(0);
    
    // Read page from URL
    const urlPage = router.query.page ? parseInt(router.query.page as string) : 1;
    setCurrentPage(urlPage || 1);
    
    const { search, bhk, minPrice, maxPrice, propertyType, city, status, sellingType, featured, sortBy: urlSortBy, sortOrder: urlSortOrder } = router.query;
    
    // Update search query from URL
    const newSearchQuery = search && typeof search === 'string' ? decodeURIComponent(search) : '';
    setSearchQuery(newSearchQuery);
    searchQueryRef.current = newSearchQuery;
    
    // Build filters from URL
    const newFilters = {
      propertyType: propertyType && typeof propertyType === 'string' ? decodeURIComponent(propertyType) : '',
      sellingType: sellingType && typeof sellingType === 'string' ? sellingType : '',
      city: city && typeof city === 'string' ? city : '',
      bhk: bhk && typeof bhk === 'string' ? bhk : '',
      status: status && typeof status === 'string' ? status : 'active',
      minPrice: minPrice && typeof minPrice === 'string' ? minPrice : '',
      maxPrice: maxPrice && typeof maxPrice === 'string' ? maxPrice : '',
    };
    
    // Update ref immediately for synchronous access (before state update)
    filtersRef.current = newFilters;
    
    // Update sort from URL
    if (urlSortBy && typeof urlSortBy === 'string') {
      setSortBy(urlSortBy);
    } else {
      setSortBy('created_at');
    }
    
    if (urlSortOrder && typeof urlSortOrder === 'string') {
      setSortOrder(urlSortOrder);
    } else {
      setSortOrder('desc');
    }
    
    // Update filters state
    setFilters(newFilters);
    
    // Mark as initialized immediately (filters are in ref, so fetch can use them)
    setHasInitializedFromUrl(true);
    setIsUpdatingFromUrl(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change (without page reload)
  // Skip URL update if we're currently reading from URL to avoid loops
  const [isUpdatingFromUrl, setIsUpdatingFromUrl] = useState(false);
  
  useEffect(() => {
    // Don't update URL if:
    // 1. Router is not ready
    // 2. We're currently reading from URL (to avoid loops)
    // 3. We haven't initialized from URL yet (prevent updates before URL params are read)
    if (!router.isReady || isUpdatingFromUrl || !hasInitializedFromUrl) {
      return;
    }
    
    const params = new URLSearchParams();
    
    if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.sellingType) params.append('sellingType', filters.sellingType);
    if (filters.city) params.append('city', filters.city);
    if (filters.bhk) params.append('bhk', filters.bhk);
    if (filters.status && filters.status !== 'active') params.append('status', filters.status);
    // Preserve featured filter from URL if present
    if (router.query.featured) params.append('featured', router.query.featured as string);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (sortBy !== 'created_at') params.append('sortBy', sortBy);
    if (sortOrder !== 'desc') params.append('sortOrder', sortOrder);
    if (currentPage > 1) params.append('page', currentPage.toString());

    // Build current URL from router.query for comparison (only non-default values)
    const currentParams = new URLSearchParams();
    if (router.query.search) currentParams.append('search', router.query.search as string);
    if (router.query.propertyType) currentParams.append('propertyType', router.query.propertyType as string);
    if (router.query.sellingType) currentParams.append('sellingType', router.query.sellingType as string);
    if (router.query.city) currentParams.append('city', router.query.city as string);
    if (router.query.bhk) currentParams.append('bhk', router.query.bhk as string);
    if (router.query.status && router.query.status !== 'active') currentParams.append('status', router.query.status as string);
    if (router.query.featured) currentParams.append('featured', router.query.featured as string);
    if (router.query.minPrice) currentParams.append('minPrice', router.query.minPrice as string);
    if (router.query.maxPrice) currentParams.append('maxPrice', router.query.maxPrice as string);
    if (router.query.sortBy && router.query.sortBy !== 'created_at') currentParams.append('sortBy', router.query.sortBy as string);
    if (router.query.sortOrder && router.query.sortOrder !== 'desc') currentParams.append('sortOrder', router.query.sortOrder as string);
    if (router.query.page && router.query.page !== '1') currentParams.append('page', router.query.page as string);
    
    // Only update URL if it's different from current URL
    const newParamsStr = params.toString();
    const currentParamsStr = currentParams.toString();
    
    if (newParamsStr !== currentParamsStr) {
      const newUrl = newParamsStr 
        ? `/properties?${newParamsStr}`
        : '/properties';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Updating URL to match filters:', newUrl);
      }
      
      router.replace(newUrl, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters, sortBy, sortOrder, currentPage, router.isReady, hasInitializedFromUrl, isUpdatingFromUrl]);

  // Fetch properties
  const fetchProperties = async () => {
    // Use refs to get the latest filter values (prevents stale closures)
    const currentFilters = filtersRef.current;
    const currentSearchQuery = searchQueryRef.current;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        limit: propertiesPerPage.toString(),
        page: currentPage.toString(),
      });

      // Only add search if it's not empty (use ref value)
      if (currentSearchQuery && currentSearchQuery.trim()) {
        params.append('search', currentSearchQuery.trim());
      } else if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }

      // Add filters only if they have values (use ref to get latest)
      if (currentFilters.propertyType) {
        params.append('propertyType', currentFilters.propertyType);
      }
      if (currentFilters.sellingType) {
        params.append('sellingType', currentFilters.sellingType);
      }
      if (currentFilters.city) {
        params.append('city', currentFilters.city);
      }
      if (currentFilters.bhk) {
        params.append('bhk', currentFilters.bhk);
      }
      if (currentFilters.status) {
        params.append('status', currentFilters.status);
      }
      // Add featured filter if present in URL
      if (router.query.featured && typeof router.query.featured === 'string') {
        params.append('featured', router.query.featured);
      }
      if (currentFilters.minPrice) {
        params.append('minPrice', currentFilters.minPrice);
      }
      if (currentFilters.maxPrice) {
        params.append('maxPrice', currentFilters.maxPrice);
      }

      const response = await fetch(`/api/get-properties?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const propertiesData = data.properties || [];
        setProperties(propertiesData);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
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
    // Only fetch properties after:
    // 1. Router is ready
    // 2. We've initialized from URL (hasInitializedFromUrl is true)
    // 3. Not currently updating from URL
    // This prevents the glitch where it shows all properties first
    if (router.isReady && hasInitializedFromUrl && !isUpdatingFromUrl) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters, sortBy, sortOrder, currentPage, router.isReady, hasInitializedFromUrl, isUpdatingFromUrl]);

  // Track previous filter values to reset page when they change (but not when page changes)
  const prevFilterSignatureRef = useRef('');
  
  useEffect(() => {
    if (!router.isReady || isUpdatingFromUrl || !hasInitializedFromUrl) {
      return;
    }
    
    // Create a signature of current filters (excluding page)
    const filterSignature = JSON.stringify({ debouncedSearchQuery, filters, sortBy, sortOrder });
    
    // If filters changed (not just page), reset to page 1
    if (prevFilterSignatureRef.current && prevFilterSignatureRef.current !== filterSignature) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      prevFilterSignatureRef.current = filterSignature;
    } else if (!prevFilterSignatureRef.current) {
      // Initialize on first run
      prevFilterSignatureRef.current = filterSignature;
    }
    // Don't update ref if only page changed - this prevents infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters, sortBy, sortOrder, router.isReady, hasInitializedFromUrl, isUpdatingFromUrl]);

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
    setPriceRange([0, 20000000]); // Max 2 Crore
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
      title="Properties for Sale & Rent in Kakkanad, Kochi | Browse Real Estate Listings"
      description="Browse our extensive collection of properties for sale and rent in Kakkanad, Kochi. Find houses, villas, flats, plots, and commercial buildings. Filter by price, location, BHK, and more. Verified listings with detailed information."
      keywords="properties Kakkanad, houses for sale Kochi, villas Kakkanad, flats for rent, plots Kakkanad, commercial buildings Kochi, property listings, real estate Kakkanad, Sowparnika Properties"
    >
      <Box backgroundColor="#f7f8f9" minH="100vh" py="3rem">
        <Container maxW="1400px">
          {/* Home Link */}
          <Box mb={6}>
            <Link href="/">
              <Button
                leftIcon={<FiHome />}
                variant="outline"
                borderColor="gray.900"
                color="gray.900"
                borderRadius="lg"
                _hover={{
                  bg: 'gray.900',
                  color: 'white',
                }}
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
              >
                Go to Home
              </Button>
            </Link>
          </Box>

          {/* Search and Filter Bar */}
          <Box
            bg="white"
            p={{ base: 5, md: 6, lg: 8 }}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)"
            mb={8}
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
          >
            {/* Top gradient accent bar */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              bgGradient="linear(to-r, gray.900, gray.700, gray.900)"
            />
            <VStack spacing={6} align="stretch" pt={0}>
              {/* Search Bar */}
              <Box position="relative">
                <InputGroup size="lg">
                  <InputLeftElement 
                    pointerEvents="none" 
                    h="100%"
                    pl={4}
                  >
                    <Icon as={FiSearch} color="gray.400" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by title, address, or city..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    pl={12}
                    pr={searchQuery ? 12 : 4}
                    h="56px"
                    fontSize="16px"
                    bg="gray.50"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    fontWeight="500"
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: 'gray.300',
                      bg: 'white',
                    }}
                    _focus={{
                      borderColor: 'gray.900',
                      bg: 'white',
                      boxShadow: '0 0 0 3px rgba(26, 26, 26, 0.1)',
                    }}
                    _placeholder={{
                      color: 'gray.400',
                    }}
                  />
                  {searchQuery && (
                    <Box
                      position="absolute"
                      right="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={2}
                    >
                      <IconButton
                        aria-label="Clear search"
                        icon={<FiX />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchQuery('')}
                        color="gray.500"
                        _hover={{
                          color: 'gray.900',
                          bg: 'gray.100',
                        }}
                      />
                    </Box>
                  )}
                </InputGroup>
              </Box>

              {/* Advanced Filtering Button - Mobile Only */}
              <Box display={{ base: 'block', md: 'none' }}>
                <Button
                  leftIcon={<FiFilter />}
                  onClick={onToggleFilters}
                  variant="outline"
                  width="100%"
                  size="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  bg="gray.50"
                  color="gray.700"
                  fontWeight="600"
                  fontFamily="'Playfair Display', serif"
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: 'gray.900',
                    bg: 'gray.900',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                >
                  {isFiltersOpen ? 'Hide Filters' : 'Advanced Filtering'}
                </Button>
              </Box>

              {/* Quick Filters - Collapsible on Mobile, Always Visible on Desktop */}
              <Collapse in={isFiltersOpen} animateOpacity>
                <Box display={{ base: 'block', md: 'none' }}>
                  <SimpleGrid columns={1} spacing={4} mt={4}>
                    <Box>
                      <Text 
                        fontSize="xs" 
                        fontWeight="600" 
                        color="gray.500" 
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Property Type
                      </Text>
                      <SleekDropdown
                        placeholder="All Property Types"
                        value={filters.propertyType}
                        onChange={(value) => setFilters({ ...filters, propertyType: value })}
                        options={[
                          { value: '', label: 'All Property Types' },
                          ...uniquePropertyTypes.map((type) => ({ value: type, label: type }))
                        ]}
                        maxW="100%"
                      />
                    </Box>

                    <Box>
                      <Text 
                        fontSize="xs" 
                        fontWeight="600" 
                        color="gray.500" 
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Sale or Rent
                      </Text>
                      <SleekDropdown
                        placeholder="Sale or Rent"
                        value={filters.sellingType}
                        onChange={(value) => setFilters({ ...filters, sellingType: value })}
                        options={[
                          { value: '', label: 'Sale or Rent' },
                          { value: 'Sale', label: 'For Sale' },
                          { value: 'Rent', label: 'For Rent' }
                        ]}
                        maxW="100%"
                      />
                    </Box>

                    <Box>
                      <Text 
                        fontSize="xs" 
                        fontWeight="600" 
                        color="gray.500" 
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        City
                      </Text>
                      <SleekDropdown
                        placeholder="All Cities"
                        value={filters.city}
                        onChange={(value) => setFilters({ ...filters, city: value })}
                        options={[
                          { value: '', label: 'All Cities' },
                          ...uniqueCities.map((city) => ({ value: city, label: city }))
                        ]}
                        maxW="100%"
                      />
                    </Box>

                    <Box>
                      <Text 
                        fontSize="xs" 
                        fontWeight="600" 
                        color="gray.500" 
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Price Range
                      </Text>
                      <PriceRangeSelector
                        value={`${filters.minPrice || '0'}-${filters.maxPrice || '20000000'}`}
                        onChange={(value) => {
                          const [min, max] = value.split('-').map(Number);
                          setFilters({
                            ...filters,
                            minPrice: min === 0 ? '' : min.toString(),
                            maxPrice: max === 20000000 ? '' : max.toString(),
                          });
                        }}
                        maxW="100%"
                      />
                    </Box>

                    <Box>
                      <Text 
                        fontSize="xs" 
                        fontWeight="600" 
                        color="gray.500" 
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Sort By
                      </Text>
                      <HStack spacing={2}>
                        <Box flex={1}>
                          <SleekDropdown
                            placeholder="Newest First"
                            value={sortBy}
                            onChange={(value) => setSortBy(value)}
                            options={[
                              { value: 'created_at', label: 'Newest First' },
                              { value: 'price', label: 'Price' },
                              { value: 'area_size', label: 'Area Size' },
                              { value: 'title', label: 'Title' }
                            ]}
                            maxW="100%"
                          />
                        </Box>
                        <IconButton
                          aria-label="Toggle sort order"
                          icon={<Icon as={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} />}
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          variant="outline"
                          size="lg"
                          minW="56px"
                          h="48px"
                          border="2px solid"
                          borderColor="gray.200"
                          borderRadius="xl"
                          bg="gray.50"
                          color="gray.700"
                          transition="all 0.2s ease"
                          _hover={{
                            borderColor: 'gray.900',
                            bg: 'gray.900',
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }}
                          _active={{
                            transform: 'translateY(0)',
                          }}
                        />
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Collapse>

              {/* Quick Filters - Desktop View (Always Visible) */}
              <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 3, xl: 5 }} 
                spacing={{ base: 4, md: 5, lg: 6 }}
                display={{ base: 'none', md: 'grid' }}
              >
                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="gray.500" 
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Property Type
                  </Text>
                  <SleekDropdown
                    placeholder="All Property Types"
                    value={filters.propertyType}
                    onChange={(value) => setFilters({ ...filters, propertyType: value })}
                    options={[
                      { value: '', label: 'All Property Types' },
                      ...uniquePropertyTypes.map((type) => ({ value: type, label: type }))
                    ]}
                    maxW="100%"
                  />
                </Box>

                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="gray.500" 
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Sale or Rent
                  </Text>
                  <SleekDropdown
                    placeholder="Sale or Rent"
                    value={filters.sellingType}
                    onChange={(value) => setFilters({ ...filters, sellingType: value })}
                    options={[
                      { value: '', label: 'Sale or Rent' },
                      { value: 'Sale', label: 'For Sale' },
                      { value: 'Rent', label: 'For Rent' }
                    ]}
                    maxW="100%"
                  />
                </Box>

                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="gray.500" 
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    City
                  </Text>
                  <SleekDropdown
                    placeholder="All Cities"
                    value={filters.city}
                    onChange={(value) => setFilters({ ...filters, city: value })}
                    options={[
                      { value: '', label: 'All Cities' },
                      ...uniqueCities.map((city) => ({ value: city, label: city }))
                    ]}
                    maxW="100%"
                  />
                </Box>

                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="gray.500" 
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Price Range
                  </Text>
                  <PriceRangeSelector
                    value={`${filters.minPrice || '0'}-${filters.maxPrice || '20000000'}`}
                    onChange={(value) => {
                      const [min, max] = value.split('-').map(Number);
                      setFilters({
                        ...filters,
                        minPrice: min === 0 ? '' : min.toString(),
                        maxPrice: max === 20000000 ? '' : max.toString(),
                      });
                    }}
                    maxW="100%"
                  />
                </Box>

                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="600" 
                    color="gray.500" 
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Sort By
                  </Text>
                  <HStack spacing={2}>
                    <Box flex={1}>
                      <SleekDropdown
                        placeholder="Newest First"
                        value={sortBy}
                        onChange={(value) => setSortBy(value)}
                        options={[
                          { value: 'created_at', label: 'Newest First' },
                          { value: 'price', label: 'Price' },
                          { value: 'area_size', label: 'Area Size' },
                          { value: 'title', label: 'Title' }
                        ]}
                        maxW="100%"
                      />
                    </Box>
                    <IconButton
                      aria-label="Toggle sort order"
                      icon={<Icon as={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} />}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      variant="outline"
                      size="lg"
                      minW="56px"
                      h="48px"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="xl"
                      bg="gray.50"
                      color="gray.700"
                      transition="all 0.2s ease"
                      _hover={{
                        borderColor: 'gray.900',
                        bg: 'gray.900',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                    />
                  </HStack>
                </Box>
              </SimpleGrid>

              <Divider borderColor="gray.200" />

              {/* Results Count and Active Filters */}
              <Flex 
                direction={{ base: 'column', sm: 'row' }} 
                justify="space-between" 
                align={{ base: 'flex-start', sm: 'center' }}
                gap={4}
                wrap="wrap"
              >
                <Box>
                  {loading ? (
                    <Text 
                      fontSize="lg" 
                      fontWeight="700" 
                      color="gray.400"
                      fontFamily="'Playfair Display', serif"
                    >
                      Loading...
                    </Text>
                  ) : (
                    <Box>
                      <Text 
                        as="span"
                        fontSize="lg" 
                        fontWeight="700" 
                        color="gray.900"
                        fontFamily="'Playfair Display', serif"
                      >
                        {total}
                      </Text>
                      <Text 
                        as="span"
                        fontSize="lg" 
                        fontWeight="500" 
                        color="gray.500"
                        fontFamily="'Playfair Display', serif"
                        ml={1}
                      >
                        {total === 1 ? 'Property' : 'Properties'} Found
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <Flex wrap="wrap" gap={2} align="center">
                    <Text fontSize="sm" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="0.05em">
                      Filters:
                    </Text>
                    {filters.propertyType && (
                      <Badge 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        bg="gray.900"
                        color="white"
                        fontSize="xs"
                        fontWeight="600"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {filters.propertyType}
                        <IconButton
                          aria-label="Remove filter"
                          icon={<FiX />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          onClick={() => setFilters({ ...filters, propertyType: '' })}
                          minW="auto"
                          h="auto"
                          p={0}
                        />
                      </Badge>
                    )}
                    {filters.sellingType && (
                      <Badge 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        bg="gray.900"
                        color="white"
                        fontSize="xs"
                        fontWeight="600"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {filters.sellingType}
                        <IconButton
                          aria-label="Remove filter"
                          icon={<FiX />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          onClick={() => setFilters({ ...filters, sellingType: '' })}
                          minW="auto"
                          h="auto"
                          p={0}
                        />
                      </Badge>
                    )}
                    {filters.city && (
                      <Badge 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        bg="gray.900"
                        color="white"
                        fontSize="xs"
                        fontWeight="600"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {filters.city}
                        <IconButton
                          aria-label="Remove filter"
                          icon={<FiX />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          onClick={() => setFilters({ ...filters, city: '' })}
                          minW="auto"
                          h="auto"
                          p={0}
                        />
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="gray"
                      onClick={clearFilters}
                      leftIcon={<FiX />}
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.600"
                      _hover={{
                        color: 'gray.900',
                        bg: 'gray.100',
                      }}
                    >
                      Clear All
                    </Button>
                  </Flex>
                )}
              </Flex>
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
            <Box 
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap={4}
              width="100%"
            >
              {transformedProperties.map((property) => (
                <Box key={property.id} width="100%" minW={0}>
                  <PropertyCard {...property} />
                </Box>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <Flex
              justify="center"
              align="center"
              mt={8}
              mb={4}
              gap={2}
              flexWrap="wrap"
            >
              {/* Previous Button */}
              <Button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isDisabled={currentPage === 1}
                leftIcon={<Icon as={FiChevronLeft} />}
                variant="outline"
                size="md"
                borderColor="gray.300"
                color="gray.700"
                _hover={{
                  bg: 'gray.50',
                  borderColor: 'gray.900',
                }}
                _disabled={{
                  opacity: 0.4,
                  cursor: 'not-allowed',
                }}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <Text color="gray.500" px={2}>
                          ...
                        </Text>
                      )}
                      <Button
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        bg={currentPage === page ? 'gray.900' : 'white'}
                        color={currentPage === page ? 'white' : 'gray.700'}
                        border="1px solid"
                        borderColor={currentPage === page ? 'gray.900' : 'gray.300'}
                        size="md"
                        minW="40px"
                        _hover={{
                          bg: currentPage === page ? 'gray.800' : 'gray.50',
                          borderColor: 'gray.900',
                        }}
                        fontWeight={currentPage === page ? '600' : '400'}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  );
                })}

              {/* Next Button */}
              <Button
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isDisabled={currentPage === totalPages}
                rightIcon={<Icon as={FiChevronRight} />}
                variant="outline"
                size="md"
                borderColor="gray.300"
                color="gray.700"
                _hover={{
                  bg: 'gray.50',
                  borderColor: 'gray.900',
                }}
                _disabled={{
                  opacity: 0.4,
                  cursor: 'not-allowed',
                }}
              >
                Next
              </Button>
            </Flex>
          )}

          {/* Page Info */}
          {totalPages > 1 && !loading && (
            <Flex justify="center" align="center" mb={8}>
              <Text fontSize="sm" color="gray.600">
                Page {currentPage} of {totalPages} • Showing {properties.length} of {total} properties
              </Text>
            </Flex>
          )}
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default Properties;
