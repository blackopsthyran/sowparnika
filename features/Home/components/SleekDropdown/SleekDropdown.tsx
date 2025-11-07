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
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px) saturate(180%)"
        border="1px solid rgba(255, 255, 255, 0.3)"
        borderRadius="lg"
        cursor="pointer"
        transition="all 0.2s ease"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        _hover={{
          bg: 'rgba(255, 255, 255, 1)',
          borderColor: 'rgba(59, 130, 246, 0.5)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'scale(0.98)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Flex align="center" gap={2} flex={1}>
          {icon && (
            <Box color="gray.500" fontSize="sm">
              {icon}
            </Box>
          )}
          <Text
            fontSize="sm"
            fontWeight="500"
            color={selectedOption ? 'gray.800' : 'gray.500'}
            noOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </Flex>
        <Icon
          as={ChevronDownIcon}
          w={4}
          h={4}
          color="gray.500"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.2s ease"
        />
      </Box>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="rgba(255, 255, 255, 0.98)"
          backdropFilter="blur(20px) saturate(200%)"
          border="1px solid rgba(255, 255, 255, 0.4)"
          borderRadius="lg"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset"
          zIndex={1000}
          overflow="hidden"
          py={1}
          maxH="300px"
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
            },
          }}
        >
          {options.map((option) => (
            <Box
              key={option.value}
              as="button"
              type="button"
              w="full"
              px={4}
              py={2.5}
              textAlign="left"
              fontSize="sm"
              fontWeight={value === option.value ? '600' : '500'}
              color={value === option.value ? 'blue.600' : 'gray.700'}
              bg={value === option.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
              transition="all 0.15s ease"
              _hover={{
                bg: value === option.value 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SleekDropdown;

