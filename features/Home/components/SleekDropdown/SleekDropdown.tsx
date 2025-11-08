import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface SleekDropdownProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactElement;
  maxW?: string | object;
}

const SleekDropdown: React.FC<SleekDropdownProps> = ({
  placeholder,
  value,
  onChange,
  options,
  icon,
  maxW = '150px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Box position="relative" maxW={maxW} w="full" ref={dropdownRef}>
      <Box
        as="button"
        type="button"
        w="full"
        px={4}
        py={3}
        bg="rgba(250, 248, 245, 0.95)"
        backdropFilter="blur(24px) saturate(200%)"
        border="1px solid rgba(220, 215, 210, 0.6)"
        borderRadius="lg"
        cursor="pointer"
        transition="all 0.2s ease"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        _hover={{
          bg: 'rgba(250, 248, 245, 1)',
          borderColor: 'rgba(220, 215, 210, 0.8)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'scale(0.98)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Flex align="center" gap={2} flex={1}>
          <Text
            fontSize="15px"
            fontWeight="500"
            color={selectedOption ? 'gray.900' : 'gray.500'}
            noOfLines={1}
            fontFamily="'Playfair Display', serif"
            letterSpacing="0.01em"
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </Flex>
        <Icon
          as={ChevronDownIcon}
          w={4}
          h={4}
          color="gray.600"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        />
      </Box>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.300"
            zIndex={9998}
            display={{ base: 'block', md: 'none' }}
            onClick={() => setIsOpen(false)}
          />
          <Box
            position={{ base: 'fixed', md: 'absolute' }}
            top={{ base: 'auto', md: '100%' }}
            bottom={{ base: '20px', md: 'auto' }}
            left={{ base: '50%', md: 0 }}
            right={{ base: 'auto', md: 0 }}
            transform={{ base: 'translateX(-50%)', md: 'none' }}
            mt={{ base: 0, md: 2 }}
            bg="white"
            border="1px solid rgba(0, 0, 0, 0.1)"
            borderRadius="lg"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)"
            zIndex={9999}
            overflow="hidden"
            py={2}
            px={2}
            minW={{ base: '280px', md: '200px' }}
            maxW={{ base: 'calc(100vw - 32px)', md: '300px' }}
            w={{ base: 'auto', md: 'auto' }}
          >
          <Flex
            direction="row"
            wrap="wrap"
            gap={1}
            w="100%"
          >
            {options.map((option) => (
              <Box
                key={option.value}
                as="button"
                type="button"
                flex={{ base: '1 1 calc(33.333% - 8px)', md: 'none' }}
                minW={{ base: 'calc(33.333% - 8px)', md: 'auto' }}
                px={{ base: 2, md: 4 }}
                py={{ base: 2, md: 2.5 }}
                textAlign="center"
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={value === option.value ? '700' : '500'}
                color={value === option.value ? 'white' : 'gray.900'}
                bg={value === option.value ? 'gray.900' : 'gray.100'}
                borderRadius="md"
                transition="all 0.15s ease"
                border="1px solid"
                borderColor={value === option.value ? 'gray.900' : 'transparent'}
                _hover={{
                  bg: value === option.value ? 'gray.800' : 'gray.200',
                  borderColor: value === option.value ? 'gray.800' : 'gray.300',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </Box>
            ))}
          </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SleekDropdown;

