import React from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';
import { TbUserCheck, TbRefresh } from 'react-icons/tb';

interface FeatureItem {
  iconComponent: React.ComponentType<any>;
  title: string;
  description: React.ReactNode;
}

const FeatureHighlights: React.FC = () => {
  const features: FeatureItem[] = [
    {
      iconComponent: FiHome,
      title: "Luxury Homes Across Kerala",
      description: (
        <>
          We connect you with the most trusted premium real estate offices across the state, giving you access to <Text as="span" fontWeight="700">stunning coastal villas, serene backwater retreats, and elegant homes</Text> tucked between lush hills and heritage towns.
        </>
      ),
    },
    {
      iconComponent: TbRefresh,
      title: "Personalised Property Discovery",
      description: (
        <>
          Your search gets the full custom treatment — <Text as="span" fontWeight="700">curated recommendations, flexible filters, saved wish lists, instant alerts</Text>, and a feed that actually matches your vibe instead of throwing random stuff at you.
        </>
      ),
    },
    {
      iconComponent: TbUserCheck,
      title: "Direct Access to the Market",
      description: (
        <>
          Listings keep refreshing throughout the day, so you're always seeing what's new in the market. You can check <Text as="span" fontWeight="700">real-time pricing trends</Text> and reach out to agents directly without any hassle.
        </>
      ),
    },
  ];

  return (
    <Box 
      bg="linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)"
      pt={{ base: 4, md: 8 }} 
      pb={{ base: 8, md: 20 }}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        bg: 'linear-gradient(to right, transparent, luxury.200, transparent)',
      }}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        {/* Logo */}
        <Box 
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={{ base: 4, md: 8 }}
        >
          <Box
            as="img"
            src="/logo.png"
            alt="Sowparnika Properties"
            height={{ base: '40px', md: '120px', lg: '150px' }}
            width="auto"
            objectFit="contain"
            loading="eager"
          />
        </Box>

        {/* Main Heading - Split into two lines */}
        <Box mb={{ base: 6, md: 16 }}>
          <Heading
            as="h1"
            fontSize={{ base: 'xl', md: '4xl', lg: '5xl' }}
            fontWeight="600"
            fontFamily="'Playfair Display', serif"
            textAlign="center"
            bgGradient="linear(to-r, gray.900, luxury.700, gray.900)"
            bgClip="text"
            lineHeight="1.2"
            sx={{
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
            }}
          >
            The Leading Marketplace for Luxury
            <Box as="br" display={{ base: 'block', md: 'block' }} />
            Properties & High Value Assets
          </Heading>
        </Box>

        {/* Feature Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: 4, md: 12 }}>
          {features.map((feature, index) => {
            const accentConfigs = [
              { color: 'luxury.600', bg: 'luxury.50', shadow: 'rgba(3, 105, 161, 0.2)' },
              { color: 'accent.600', bg: 'accent.50', shadow: 'rgba(192, 38, 211, 0.2)' },
              { color: 'warm.600', bg: 'warm.50', shadow: 'rgba(245, 158, 11, 0.2)' },
            ];
            const accentConfig = accentConfigs[index % accentConfigs.length];
            const accentColor = accentConfig.color;
            const accentBg = accentConfig.bg;
            const accentShadow = accentConfig.shadow;
            
            return (
              <GridItem key={index}>
                <VStack spacing={{ base: 2, md: 6 }} align="center" textAlign="center">
                  <Box 
                    color={accentColor} 
                    mb={{ base: 0, md: 2 }}
                    p={4}
                    borderRadius="full"
                    bg={accentBg}
                    transition="all 0.3s"
                    _hover={{
                      transform: 'scale(1.1)',
                      color: accentColor,
                      boxShadow: `0 8px 16px ${accentShadow}`,
                    }}
                  >
                    <Box display={{ base: 'block', md: 'none' }}>
                      <feature.iconComponent size={24} strokeWidth={1.5} />
                    </Box>
                    <Box display={{ base: 'none', md: 'block' }}>
                      <feature.iconComponent size={48} strokeWidth={1.5} />
                    </Box>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize={{ base: 'sm', md: 'xl' }}
                    fontWeight="700"
                    fontFamily="'Playfair Display', serif"
                    color="gray.900"
                    lineHeight="1.3"
                    _hover={{
                      color: accentColor,
                      transition: 'color 0.3s',
                    }}
                  >
                    {feature.title}
                  </Heading>
                  <Box
                    as="div"
                    fontSize={{ base: 'xs', md: 'md' }}
                    color="gray.700"
                    lineHeight={{ base: '1.4', md: '1.7' }}
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
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureHighlights;

