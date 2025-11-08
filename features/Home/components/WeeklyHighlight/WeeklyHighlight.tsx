import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, HStack, IconButton, Link as ChakraLink } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import { usePropertyFormat } from '@/features/common/Hooks/usePropertyFormat';

interface WeeklyHighlightProps {
  property?: any;
}

const WeeklyHighlight: React.FC<WeeklyHighlightProps> = ({ property }) => {
  const [featuredProperty, setFeaturedProperty] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (property) {
      setFeaturedProperty(property);
    } else {
      // Fetch a featured property if none provided
      fetch('/api/get-properties?status=active&limit=1&sortBy=created_at&sortOrder=desc')
        .then(res => res.json())
        .then(data => {
          if (data.properties && data.properties.length > 0) {
            setFeaturedProperty(data.properties[0]);
          }
        })
        .catch(err => console.error('Error fetching featured property:', err));
    }
  }, [property]);

  if (!featuredProperty) {
    return null;
  }

  const {
    title,
    address,
    price,
    rooms,
    baths,
    sqSize,
    areaUnit,
    coverPhoto,
    externalID,
    description,
  } = usePropertyFormat(featuredProperty);

  // Strip HTML tags and truncate description
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    // Remove HTML tags including <p>, <div>, <br>, etc.
    let text = html.replace(/<[^>]*>/g, '');
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const propertyDescription = stripHtmlTags(description || title || '');
  const truncatedDescription = propertyDescription.length > 200 
    ? propertyDescription.substring(0, 200) + '...' 
    : propertyDescription;

  // Format square footage (remove decimals if whole number, otherwise show 2 decimals)
  const formattedSqft = sqSize && sqSize !== '0.00' 
    ? (parseFloat(sqSize) % 1 === 0 ? parseInt(sqSize).toLocaleString('en-IN') : parseFloat(sqSize).toLocaleString('en-IN', { maximumFractionDigits: 0 }))
    : '0';

  return (
    <Box bg="white" py={16}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          {/* Left Section - Text Content */}
          <GridItem>
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="700"
              fontFamily="'Playfair Display', serif"
              mb={4}
              color="gray.900"
            >
              Weekly highlight
            </Heading>
            
            <Text
              fontSize="lg"
              color="gray.600"
              mb={6}
              fontFamily="'Inter', sans-serif"
            >
              {address || title}
            </Text>

            <Text
              fontSize="md"
              color="gray.700"
              lineHeight="tall"
              mb={6}
              fontFamily="'Inter', sans-serif"
            >
              {truncatedDescription}
            </Text>

            <ChakraLink
              as={Link}
              href={`/properties/${externalID}`}
              color="blue.600"
              fontWeight="600"
              fontSize="md"
              _hover={{ color: 'blue.700', textDecoration: 'underline' }}
              fontFamily="'Inter', sans-serif"
            >
              Read more →
            </ChakraLink>

            <Box mt={8}>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="700"
                color="gray.900"
                mb={4}
                fontFamily="'Playfair Display', serif"
              >
                {price || 'Price on request'}
              </Text>
              
              <HStack spacing={4} color="gray.600" fontSize="md" fontFamily="'Inter', sans-serif">
                <Text>{rooms || 0} Beds</Text>
                <Text>·</Text>
                <Text>{baths || 0} Baths</Text>
                <Text>·</Text>
                <Text>{formattedSqft} {areaUnit || 'sq ft'}</Text>
              </HStack>
            </Box>
          </GridItem>

          {/* Right Section - Image */}
          <GridItem position="relative">
            <Box
              position="relative"
              width="100%"
              aspectRatio="4/3"
              borderRadius="lg"
              overflow="hidden"
              bg="gray.200"
            >
              <Box
                as="img"
                src={coverPhoto || 'https://placehold.co/1200x900/e2e8f0/64748b?text=Property+Image'}
                alt={title || 'Featured Property'}
                width="100%"
                height="100%"
                objectFit="cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/1200x900/e2e8f0/64748b?text=Property+Image';
                }}
              />
              
              {/* Favorite Button */}
              <IconButton
                aria-label="Add to favorites"
                icon={<FiHeart />}
                position="absolute"
                top={4}
                right={4}
                borderRadius="full"
                bg="white"
                color={isFavorite ? 'red.500' : 'gray.600'}
                _hover={{ bg: 'gray.50', color: 'red.500' }}
                onClick={() => setIsFavorite(!isFavorite)}
                size="lg"
                boxShadow="lg"
              />
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default WeeklyHighlight;

