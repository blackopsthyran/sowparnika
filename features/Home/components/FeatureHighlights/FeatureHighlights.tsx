import React from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';
import { TbUserCheck, TbRefresh } from 'react-icons/tb';

interface FeatureItem {
  icon: React.ReactElement;
  title: string;
  description: React.ReactNode;
}

const FeatureHighlights: React.FC = () => {
  const features: FeatureItem[] = [
    {
      icon: <FiHome size={48} strokeWidth={1.5} />,
      title: "All The World's Luxury Listings",
      description: (
        <>
          We work with <Text as="span" fontWeight="700">16,000</Text> leading luxury real estate offices globally to give you access to over <Text as="span" fontWeight="700">400,000</Text> of the finest listings.
        </>
      ),
    },
    {
      icon: <TbRefresh size={48} strokeWidth={1.5} />,
      title: "Personalised Discovery",
      description: (
        <>
          We personalise your property search and deliver tailored recommendations. Enjoy <Text as="span" fontWeight="700">custom search filters, wish lists, listing alerts, and personalised feeds</Text>.
        </>
      ),
    },
    {
      icon: <TbUserCheck size={48} strokeWidth={1.5} />,
      title: "Direct Market Contact",
      description: (
        <>
          Our inventory is updated several times daily, allowing for <Text as="span" fontWeight="700">3,000</Text> new listings per day, <Text as="span" fontWeight="700">real time market prices and direct contact</Text> with listing agents.
        </>
      ),
    },
  ];

  return (
    <Box bg="gray.50" pt={8} pb={20}>
      <Container maxW="container.xl">
        {/* Logo */}
        <Box 
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={8}
        >
          <Box
            as="img"
            src="/logo.png"
            alt="Sowparnika Properties"
            height={{ base: '80px', md: '120px', lg: '150px' }}
            width="auto"
            objectFit="contain"
            loading="eager"
          />
        </Box>

        {/* Main Heading - Split into two lines */}
        <Box mb={16}>
          <Heading
            as="h1"
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="600"
            fontFamily="'Playfair Display', serif"
            textAlign="center"
            color="gray.900"
            lineHeight="1.2"
          >
            The Leading Marketplace for Luxury
            <Box as="br" display={{ base: 'block', md: 'block' }} />
            Properties & High Value Assets
          </Heading>
        </Box>

        {/* Feature Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={12}>
          {features.map((feature, index) => (
            <GridItem key={index}>
              <VStack spacing={6} align="center" textAlign="center">
                <Box color="gray.900" mb={2}>
                  {feature.icon}
                </Box>
                <Heading
                  as="h3"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight="700"
                  fontFamily="'Playfair Display', serif"
                  color="gray.900"
                  lineHeight="1.3"
                >
                  {feature.title}
                </Heading>
                <Box
                  as="div"
                  fontSize={{ base: 'sm', md: 'md' }}
                  color="gray.900"
                  lineHeight="1.7"
                  fontFamily="'Bodoni Moda', serif"
                  fontWeight="400"
                  maxW="400px"
                  sx={{
                    fontVariationSettings: '"opsz" 14, "wght" 300',
                    letterSpacing: '0.01em',
                    fontOpticalSizing: 'auto',
                  }}
                >
                  {feature.description}
                </Box>
              </VStack>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureHighlights;

