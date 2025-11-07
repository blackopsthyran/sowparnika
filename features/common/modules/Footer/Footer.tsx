import React from 'react';
import Link from 'next/link';
import { Box, Flex, SimpleGrid, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import {
  services,
  about,
  ourOffices,
  workWithUs,
} from '@/features/common/modules/Footer/FooterConst';

const Footer = () => {
  return (
    <Box backgroundColor="gray.900" color="white">
      {/* Main Footer Content */}
      <Box
        maxWidth="1280px"
        margin="0 auto"
        paddingY="4rem"
        paddingX={{ base: '2rem', md: '3rem' }}
      >
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          gap="2.5rem"
          mb="3rem"
        >
          {/* Company Info */}
          <VStack align="flex-start" spacing={4}>
            <Box>
              <Box
                as="img"
                src="/logo.png"
                alt="Sowparnika Properties"
                height="70px"
                width="auto"
                objectFit="contain"
                mb={3}
                loading="eager"
              />
              <Text fontSize="sm" color="gray.400" lineHeight="tall" mb={4} fontFamily="'Playfair Display', serif">
                Your trusted gateway to real estate in Kakkanad, Kochi. We offer verified properties, expert consultation, and full-service support.
              </Text>
              <HStack spacing={4} mt={4}>
                <IconButtonLink
                  icon={FiFacebook}
                  href="https://facebook.com"
                  aria-label="Facebook"
                />
                <IconButtonLink
                  icon={FiTwitter}
                  href="https://twitter.com"
                  aria-label="Twitter"
                />
                <IconButtonLink
                  icon={FiInstagram}
                  href="https://instagram.com"
                  aria-label="Instagram"
                />
                <IconButtonLink
                  icon={FiLinkedin}
                  href="https://linkedin.com"
                  aria-label="LinkedIn"
                />
              </HStack>
            </Box>
          </VStack>

          {/* Services */}
          <VStack align="flex-start" spacing={3}>
            <FooterHeader title="Services" />
            {services.map((item) => (
              <FooterLink key={item.name} link={item.link} name={item.name} />
            ))}
          </VStack>

          {/* About */}
          <VStack align="flex-start" spacing={3}>
            <FooterHeader title="About" />
            {about.map((item) => (
              <FooterLink key={item.name} link={item.link} name={item.name} />
            ))}
          </VStack>

          {/* Contact & Offices */}
          <VStack align="flex-start" spacing={3}>
            <FooterHeader title="Contact & Offices" />
            {ourOffices.map((item) => (
              <FooterLink key={item.name} link={item.link} name={item.name} />
            ))}
            <Box mt={2} pt={2} borderTop="1px solid" borderColor="gray.700">
              <ContactInfo 
                icon={FiMapPin} 
                text="Door No: 6 / 754 H, Vallathol Junction, Seaport - Airport Rd, Kakkanad, Kochi, Kerala 682021" 
              />
              <ContactInfo icon={FiPhone} text="+91 9446211417" />
              <ContactInfo icon={FiMail} text="info@sowparnikaproperties.com" />
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Work With Us Section */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          borderRadius="lg"
          p={6}
          mb="2rem"
        >
          <Text fontSize="md" fontWeight="600" mb={4} fontFamily="'Playfair Display', serif">
            Work With Us
          </Text>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={3}>
            {workWithUs.map((item) => (
              <FooterLink key={item.name} link={item.link} name={item.name} />
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Copyright Section */}
      <Box
        backgroundColor="black"
        borderTop="1px solid"
        borderColor="gray.800"
        padding="2rem"
      >
        <Box maxWidth="1280px" margin="0 auto" px={{ base: '2rem', md: '3rem' }}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontSize="sm" color="gray.400" textAlign={{ base: 'center', md: 'left' }} fontFamily="'Playfair Display', serif">
              © {new Date().getFullYear()} Sowparnika Properties. All rights reserved.
            </Text>
            <HStack spacing={6} fontSize="xs" color="gray.500">
              <Link href="/privacy-policy">
                <Text _hover={{ color: 'white' }} transition="color 0.2s" fontFamily="'Playfair Display', serif">
                  Privacy Policy
                </Text>
              </Link>
              <Link href="/terms-of-service">
                <Text _hover={{ color: 'white' }} transition="color 0.2s" fontFamily="'Playfair Display', serif">
                  Terms of Service
                </Text>
              </Link>
              <Link href="/sitemap">
                <Text _hover={{ color: 'white' }} transition="color 0.2s" fontFamily="'Playfair Display', serif">
                  Sitemap
                </Text>
              </Link>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;

const FooterLink = ({ link, name }: { link: string; name: string }) => {
  return (
    <Link href={link}>
      <Text
        fontSize="sm"
        color="gray.400"
        _hover={{ color: 'white', transform: 'translateX(4px)' }}
        transition="all 0.2s"
        cursor="pointer"
        fontFamily="'Playfair Display', serif"
      >
        {name}
      </Text>
    </Link>
  );
};

const FooterHeader = ({ title }: { title: string }) => {
  return (
    <Text as="h4" fontWeight="600" fontSize="md" marginBottom="0.5rem" color="white" fontFamily="'Playfair Display', serif">
      {title}
    </Text>
  );
};

const ContactInfo = ({ icon, text }: { icon: any; text: string }) => {
  return (
    <HStack spacing={2} mb={2} color="gray.400" fontSize="sm">
      <Icon as={icon} />
      <Text fontFamily="'Playfair Display', serif">{text}</Text>
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
      w="36px"
      h="36px"
      borderRadius="full"
      bg="rgba(255, 255, 255, 0.1)"
      color="gray.400"
      _hover={{ bg: 'blue.600', color: 'white', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      aria-label={ariaLabel}
      role="button"
    >
      <Icon as={icon} />
    </Box>
  );
};
