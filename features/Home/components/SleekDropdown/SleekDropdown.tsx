import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Box, Text, Icon, Flex, Button, Portal } from '@chakra-ui/react';
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
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate dropdown position
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let left = rect.left;
      const dropdownWidth = 300;
      const dropdownHeight = 150; // Approximate height of dropdown
      const gap = 8;

      // Adjust if dropdown would go off-screen on the right
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }

      // Ensure dropdown doesn't go off-screen on the left
      if (left < 16) {
        left = 16;
      }

      // Calculate top position - try below first
      let top = rect.bottom + gap;

      // If dropdown would go off bottom of screen, position above button
      if (top + dropdownHeight > window.innerHeight - 16) {
        top = rect.top - dropdownHeight - gap;
        // Ensure it doesn't go off top of screen
        if (top < 16) {
          top = 16;
        }
      }

      setDropdownPosition({
        top: Math.max(8, top),
        left: left,
        width: rect.width,
      });
    }
  };

  // Update position when dropdown opens
  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      // Update dropdown position on scroll
      if (isOpen) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      // Update dropdown position on resize
      if (isOpen) {
        calculatePosition();
      }
    };

    // Debounce resize handler
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', debouncedResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(resizeTimeout);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Box position="relative" maxW={maxW} w="full">
      <Box
        ref={buttonRef as any}
        // @ts-ignore - Chakra UI Box as button type issue
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
        // @ts-ignore - Chakra UI Box as button onClick type issue
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            // Calculate position before opening
            calculatePosition();
          }
          setIsOpen(!isOpen);
        }}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
        role="button"
        tabIndex={0}
      >
        <Flex align="center" gap={2} flex={1}>
          <Text
            fontSize={{ base: '11px', md: '15px' }}
            fontWeight="500"
            color={selectedOption && selectedOption.value !== '' ? 'gray.900' : 'gray.500'}
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
          <Portal>
            {dropdownPosition.top > 0 && (
              <Box
                ref={dropdownRef}
                position="fixed"
                top={`${dropdownPosition.top}px`}
                left={{ base: '50%', md: `${dropdownPosition.left}px` }}
                transform={{ base: 'translateX(-50%)', md: 'none' }}
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
                onClick={(e) => e.stopPropagation()}
              >
                <Flex
                  direction="row"
                  wrap="wrap"
                  gap={1}
                  w="100%"
                >
                  {options.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      flex={{ base: '1 1 calc(33.333% - 8px)', md: 'none' }}
                      minW={{ base: 'calc(33.333% - 8px)', md: 'auto' }}
                      px={{ base: 2, md: 4 }}
                      py={{ base: 2, md: 2.5 }}
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
                      h="auto"
                      lineHeight="normal"
                    >
                      {option.label}
                    </Button>
                  ))}
                </Flex>
              </Box>
            )}
          </Portal>
        </>
      )}
    </Box>
  );
};

export default SleekDropdown;

