import React from 'react';
import Link from 'next/link';
import { Box, Flex, Grid, GridItem, Text, VStack, HStack, Icon, Divider } from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import {
  services,
  about,
  ourOffices,
  workWithUs,
} from '@/features/common/modules/Footer/FooterConst';

// Helper Components (defined before Footer to avoid hoisting issues)
const FooterLink = ({ link, name }: { link: string; name: string }) => {
  return (
    <Link href={link} style={{ display: 'block' }}>
      <Text
        fontSize="sm"
        color="gray.300"
        transition="all 0.2s ease"
        cursor="pointer"
        fontFamily="'Inter', sans-serif"
        fontWeight="400"
        position="relative"
        display="inline-block"
        _before={{
          content: '""',
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '0',
          height: '1px',
          bg: 'yellow.400',
          transition: 'width 0.2s ease',
        }}
        _hover={{ 
          color: 'white', 
          transform: 'translateX(4px)',
          textDecoration: 'none',
          _before: {
            width: '100%',
          },
        }}
      >
        {name}
      </Text>
    </Link>
  );
};

const FooterHeader = ({ title }: { title: string }) => {
  return (
    <Text 
      as="h4" 
      fontWeight="600" 
      fontSize="md" 
      color="white" 
      fontFamily="'Playfair Display', serif"
      letterSpacing="0.02em"
      mb={1}
    >
      {title}
    </Text>
  );
};

const ContactInfo = ({ icon, text }: { icon: any; text: string }) => {
  return (
    <HStack 
      spacing={3} 
      align="flex-start"
      color="gray.300" 
      fontSize="sm"
      _hover={{ color: 'white' }}
      transition="color 0.2s"
    >
      <Icon 
        as={icon} 
        color="gray.400" 
        mt={0.5}
        flexShrink={0}
        _groupHover={{ color: 'yellow.400' }}
      />
      <Text 
        fontFamily="'Inter', sans-serif" 
        color="gray.300"
        lineHeight="1.6"
        flex={1}
      >
        {text}
      </Text>
    </HStack>
  );
};

const IconButtonLink = ({ icon, href, ariaLabel }: { icon: any; href: string; ariaLabel: string }) => {
  return (
    <Box
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="40px"
      h="40px"
      borderRadius="lg"
      bg="rgba(255, 255, 255, 0.08)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      color="gray.400"
      _hover={{ 
        bg: 'yellow.400', 
        color: 'gray.900', 
        transform: 'translateY(-3px)',
        borderColor: 'yellow.400',
        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)'
      }}
      transition="all 0.3s ease"
      aria-label={ariaLabel}
      role="button"
    >
      <Icon as={icon} fontSize="18px" />
    </Box>
  );
};

const PolicyLink = ({ href, text }: { href: string; text: string }) => {
  return (
    <Link href={href}>
      <Text 
        _hover={{ color: 'white' }} 
        transition="color 0.2s" 
        fontFamily="'Inter', sans-serif"
        fontSize="sm"
        color="gray.500"
      >
        {text}
      </Text>
    </Link>
  );
};

const Footer = () => {
  return (
    <Box 
      backgroundColor="gray.900" 
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative gradient overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="2px"
        bgGradient="linear(to-r, transparent, yellow.400, transparent)"
        opacity="0.3"
      />
      
      {/* Main Footer Content */}
      <Box
        maxWidth="1400px"
        margin="0 auto"
        paddingTop={{ base: '3rem', md: '4rem' }}
        paddingBottom={{ base: '0.5rem', md: '1rem' }}
        paddingX={{ base: '1.5rem', md: '2.5rem', lg: '4rem' }}
        position="relative"
        zIndex={1}
      >
        {/* Top Section - Company Info and Links */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: '2fr 1fr 1fr 1.5fr'
          }}
          gap={{ base: '2.5rem', md: '3rem', lg: '4rem' }}
          mb={{ base: '2rem', md: '2.5rem' }}
        >
          {/* Company Info - Left Column */}
          <GridItem>
            <VStack align="flex-start" spacing={5}>
              {/* Logo and Company Name */}
              <Box>
                <Box
                  as="img"
                  src="/logo.png"
                  alt="Sowparnika Properties"
                  height={{ base: '80px', md: '100px', lg: '120px' }}
                  width="auto"
                  objectFit="contain"
                  mb={4}
                  loading="eager"
                />
                <Text 
                  fontSize={{ base: 'xl', md: '2xl' }} 
                  fontWeight="700" 
                  color="white" 
                  mb={2}
                  fontFamily="'Playfair Display', serif"
                  letterSpacing="0.05em"
                >
                  SOWPARNIKA PROPERTIES
                </Text>
                <Text 
                  fontSize="xs" 
                  color="gray.400" 
                  mb={4}
                  fontWeight="500"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                >
                  YOUR ONLINE GATEWAY TO REAL ESTATE
                </Text>
              </Box>
              
              {/* Description */}
              <Text 
                fontSize="sm" 
                color="gray.300" 
                lineHeight="1.8" 
                maxW="400px"
                fontFamily="'Inter', sans-serif"
              >
                Your trusted gateway to real estate in Kakkanad, Kochi. We offer verified properties, expert consultation, and full-service support.
              </Text>
              
              {/* Social Media Icons */}
              <HStack spacing={3} mt={2}>
                <IconButtonLink
                  icon={FaYoutube}
                  href="https://www.youtube.com/@sowparnikaproperties"
                  ariaLabel="YouTube"
                />
                <IconButtonLink
                  icon={FiInstagram}
                  href="https://www.instagram.com/sowparnika.properties/"
                  ariaLabel="Instagram"
                />
              </HStack>
            </VStack>
          </GridItem>

          {/* Services Column */}
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <FooterHeader title="Services" />
              <VStack align="flex-start" spacing={3}>
                {services.map((item) => (
                  <FooterLink key={item.name} link={item.link} name={item.name} />
                ))}
              </VStack>
            </VStack>
          </GridItem>

          {/* About Column */}
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <FooterHeader title="About" />
              <VStack align="flex-start" spacing={3}>
                {about.map((item) => (
                  <FooterLink key={item.name} link={item.link} name={item.name} />
                ))}
              </VStack>
            </VStack>
          </GridItem>

          {/* Contact & Offices Column */}
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <FooterHeader title="Contact & Offices" />
              <VStack align="flex-start" spacing={4} w="100%">
                {/* Office Links */}
                <VStack align="flex-start" spacing={2.5} w="100%">
                  {ourOffices.map((item) => (
                    <FooterLink key={item.name} link={item.link} name={item.name} />
                  ))}
                </VStack>
                
                {/* Divider */}
                <Divider borderColor="gray.700" opacity={0.5} />
                
                {/* Contact Information */}
                <VStack align="flex-start" spacing={3} w="100%">
                  <ContactInfo 
                    icon={FiMapPin} 
                    text="Door No: 6 / 754 H, Vallathol Junction, Seaport - Airport Rd, Kakkanad, Kochi, Kerala 682021" 
                  />
                  <ContactInfo icon={FiPhone} text="+91 9446211417" />
                  <ContactInfo icon={FiMail} text="info@sowparnikaproperties.com" />
                </VStack>
              </VStack>
            </VStack>
          </GridItem>
        </Grid>

        {/* Work With Us Section */}
        <Box
          bg="rgba(255, 255, 255, 0.03)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          mb={0}
          backdropFilter="blur(10px)"
        >
          <Text 
            fontSize="lg" 
            fontWeight="600" 
            mb={5} 
            fontFamily="'Playfair Display', serif" 
            color="white"
            letterSpacing="0.02em"
          >
            Work With Us
          </Text>
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            flexWrap="wrap"
            gap={{ base: 3, sm: 4, md: 6 }}
          >
            {workWithUs.map((item) => (
              <Box key={item.name} flex="0 0 auto">
                <FooterLink link={item.link} name={item.name} />
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>

      {/* Copyright Section */}
      <Box
        backgroundColor="black"
        borderTop="1px solid"
        borderColor="gray.800"
        paddingY={{ base: '1.5rem', md: '2rem' }}
        position="relative"
      >
        <Box maxWidth="1400px" margin="0 auto" px={{ base: '1.5rem', md: '2.5rem', lg: '4rem' }}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text 
              fontSize="sm" 
              color="gray.400" 
              textAlign={{ base: 'center', md: 'left' }} 
              fontFamily="'Inter', sans-serif"
            >
              © {new Date().getFullYear()} Sowparnika Properties. All rights reserved.
            </Text>
            <HStack 
              spacing={{ base: 4, md: 6 }} 
              fontSize="sm" 
              color="gray.500"
              flexWrap="wrap"
              justify={{ base: 'center', md: 'flex-end' }}
            >
              <PolicyLink href="/privacy-policy" text="Privacy Policy" />
              <PolicyLink href="/terms-of-service" text="Terms of Service" />
              <PolicyLink href="/sitemap" text="Sitemap" />
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
