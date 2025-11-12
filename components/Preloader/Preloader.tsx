import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, keyframes } from '@chakra-ui/react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 500);
    }
  }, [progress, onComplete]);

  const fadeOut = keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `;

  const slideIn = keyframes`
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const lineDraw = keyframes`
    from { 
      width: 0;
      opacity: 0;
    }
    to { 
      width: 100%;
      opacity: 1;
    }
  `;

  const shimmer = keyframes`
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  `;

  return (
    <>
      {isVisible && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          animation={!isVisible ? `${fadeOut} 0.5s ease-out forwards` : 'none'}
          overflow="hidden"
        >
          {/* Geometric Background Pattern - Subtle Grid */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={0.03}
            sx={{
              backgroundImage: `
                linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Diagonal Lines - Edgy Design Element */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            opacity={0.05}
            sx={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            }}
          />

          {/* Main Content Container */}
          <Box
            position="relative"
            width="100%"
            maxW="600px"
            px={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            zIndex={10}
          >
            {/* Logo */}
            <Box
              as="img"
              src="/logo.png"
              alt="Sowparnika Properties"
              height={{ base: '120px', md: '160px', lg: '200px' }}
              width="auto"
              objectFit="contain"
              loading="eager"
              mb={16}
              sx={{
                animation: `${slideIn} 0.8s ease-out`,
              }}
            />

            {/* Sharp, Edgy Progress Bar Container */}
            <Box width="100%" maxW="400px" mb={6}>
              {/* Progress Bar Background - Sharp corners */}
              <Box
                height="3px"
                bg="rgba(0, 0, 0, 0.1)"
                borderRadius="0"
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.2)"
              >
                {/* Progress Fill - Sharp, crisp */}
                <Box
                  height="100%"
                  width={`${progress}%`}
                  bg="gray.900"
                  borderRadius="0"
                  transition="width 0.3s ease-out"
                  position="relative"
                  sx={{
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.3), transparent)',
                      animation: `${shimmer} 2s infinite`,
                      backgroundSize: '200% 100%',
                    },
                  }}
                />
              </Box>

              {/* Sharp corner accent lines */}
              <Flex justifyContent="space-between" mt={2} position="relative">
                <Box
                  width="20px"
                  height="1px"
                  bg="rgba(0, 0, 0, 0.3)"
                  borderRadius="0"
                />
                <Box
                  width="20px"
                  height="1px"
                  bg="rgba(0, 0, 0, 0.3)"
                  borderRadius="0"
                />
              </Flex>
            </Box>

            {/* Progress Percentage - Elegant Typography */}
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.900"
              fontFamily="'Playfair Display', serif"
              letterSpacing="0.2em"
              fontWeight="600"
              mb={8}
              sx={{
                animation: `${slideIn} 0.8s ease-out 0.3s both`,
                opacity: 0.9,
              }}
            >
              {Math.round(progress)}%
            </Text>

            {/* Loading Text - Minimal, Elegant */}
            <Text
              fontSize="xs"
              color="rgba(0, 0, 0, 0.6)"
              fontFamily="'Inter', sans-serif"
              letterSpacing="0.3em"
              textTransform="uppercase"
              fontWeight="300"
              sx={{
                animation: `${slideIn} 0.8s ease-out 0.5s both`,
              }}
            >
              Finding Your Dream Property
            </Text>

            {/* Geometric Divider Lines - Edgy Design */}
            <Flex
              alignItems="center"
              gap={4}
              mt={12}
              width="100%"
              maxW="200px"
              sx={{
                animation: `${slideIn} 0.8s ease-out 0.7s both`,
              }}
            >
              <Box
                flex="1"
                height="1px"
                bg="rgba(0, 0, 0, 0.2)"
                borderRadius="0"
              />
              <Box
                width="4px"
                height="4px"
                bg="gray.900"
                borderRadius="0"
                transform="rotate(45deg)"
              />
              <Box
                flex="1"
                height="1px"
                bg="rgba(0, 0, 0, 0.2)"
                borderRadius="0"
              />
            </Flex>
          </Box>

          {/* Corner Accents - Sharp, Geometric */}
          <Box
            position="absolute"
            top="40px"
            left="40px"
            width="60px"
            height="60px"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
            borderRight="none"
            borderBottom="none"
            borderRadius="0"
            opacity={0.3}
          />
          <Box
            position="absolute"
            top="40px"
            right="40px"
            width="60px"
            height="60px"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
            borderLeft="none"
            borderBottom="none"
            borderRadius="0"
            opacity={0.3}
          />
          <Box
            position="absolute"
            bottom="40px"
            left="40px"
            width="60px"
            height="60px"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
            borderRight="none"
            borderTop="none"
            borderRadius="0"
            opacity={0.3}
          />
          <Box
            position="absolute"
            bottom="40px"
            right="40px"
            width="60px"
            height="60px"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
            borderLeft="none"
            borderTop="none"
            borderRadius="0"
            opacity={0.3}
          />
        </Box>
      )}
    </>
  );
};

export default Preloader;
