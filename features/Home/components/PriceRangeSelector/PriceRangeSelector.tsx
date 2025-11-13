import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Box, Text, Icon, Flex, Input, IconButton, HStack, VStack, Portal } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface PriceRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  maxW?: string | object;
}

const MAX_PRICE = 20000000; // 2 Crore
const MIN_PRICE = 0;

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  value,
  onChange,
  maxW = '180px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(''); // Raw input value (no formatting)
  const [maxPriceInput, setMaxPriceInput] = useState(''); // Raw input value (no formatting)
  const [sliderMin, setSliderMin] = useState(MIN_PRICE);
  const [sliderMax, setSliderMax] = useState(MAX_PRICE);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let left = rect.left;
      const dropdownWidth = 420;
      const dropdownHeight = 250; // Approximate height of dropdown
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
  }, []);
  
  // Update position when dropdown opens
  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  // Track if we're updating internally to avoid overwriting user input
  const isInternalUpdateRef = useRef(false);
  
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    if (value) {
      const [min, max] = value.split('-').map(Number);
      const minVal = min || MIN_PRICE;
      const maxVal = max || MAX_PRICE;
      
      setSliderMin(minVal);
      setSliderMax(maxVal);
      
      if (minVal === MIN_PRICE) {
        setMinPriceInput('');
      } else {
        setMinPriceInput(minVal.toString());
      }
      if (maxVal === MAX_PRICE) {
        setMaxPriceInput('');
      } else {
        setMaxPriceInput(maxVal.toString());
      }
    } else {
      setSliderMin(MIN_PRICE);
      setSliderMax(MAX_PRICE);
      setMinPriceInput('');
      setMaxPriceInput('');
    }
  }, [value]);

  const updatePrices = useCallback((min: number, max: number, updateInputs = true) => {
    const newMin = Math.min(min, max);
    const newMax = Math.max(min, max);
    setSliderMin(newMin);
    setSliderMax(newMax);
    // Only update input values if explicitly requested (from slider, not from input fields)
    if (updateInputs) {
      if (newMin === MIN_PRICE) {
        setMinPriceInput('');
      } else {
        setMinPriceInput(newMin.toString());
      }
      if (newMax === MAX_PRICE) {
        setMaxPriceInput('');
      } else {
        setMaxPriceInput(newMax.toString());
      }
    }
    isInternalUpdateRef.current = true;
    onChange(`${newMin}-${newMax}`);
  }, [onChange]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMinPriceInput(val); // Store raw value for input field immediately
    
    if (val === '') {
      const newMin = MIN_PRICE;
      setSliderMin(newMin);
      isInternalUpdateRef.current = true;
      onChange(`${newMin}-${sliderMax}`);
    } else {
      const numVal = Math.min(Number(val), sliderMax);
      setSliderMin(numVal);
      isInternalUpdateRef.current = true;
      onChange(`${numVal}-${sliderMax}`);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMaxPriceInput(val); // Store raw value for input field immediately
    
    if (val === '') {
      const newMax = MAX_PRICE;
      setSliderMax(newMax);
      isInternalUpdateRef.current = true;
      onChange(`${sliderMin}-${newMax}`);
    } else {
      const numVal = Math.max(Number(val), sliderMin);
      setSliderMax(numVal);
      isInternalUpdateRef.current = true;
      onChange(`${sliderMin}-${numVal}`);
    }
  };

  const clearMin = () => {
    setMinPriceInput('');
    updatePrices(MIN_PRICE, sliderMax, true);
  };

  const clearMax = () => {
    setMaxPriceInput('');
    updatePrices(sliderMin, MAX_PRICE, true);
  };

  const getSliderPosition = (value: number) => {
    return ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't handle clicks if dragging
    if (isDraggingMin || isDraggingMax) return;
    // Don't handle clicks on handles
    if ((e.target as HTMLElement).closest('[data-handle]')) return;
    
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const clickedValue = Math.round((percentage / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE);
    
    const minDistance = Math.abs(clickedValue - sliderMin);
    const maxDistance = Math.abs(clickedValue - sliderMax);
    
    if (minDistance < maxDistance) {
      const newMin = Math.min(clickedValue, sliderMax - 100000);
      updatePrices(newMin, sliderMax, true);
    } else {
      const newMax = Math.max(clickedValue, sliderMin + 100000);
      updatePrices(sliderMin, newMax, true);
    }
  };

  const handleMinDragStart = (clientX: number) => {
    if (!sliderRef.current) return;
    setIsDraggingMin(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = 'touches' in moveEvent ? moveEvent.touches[0].clientX - rect.left : moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = Math.round((percentage / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE);
      // Prevent min from exceeding max (ensure min is at least 100k less than max)
      const newMin = Math.min(newValue, Math.max(MIN_PRICE, sliderMax - 100000));
      updatePrices(newMin, sliderMax);
    };
    
    const handleEnd = () => {
      setIsDraggingMin(false);
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove as EventListener, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  const handleMaxDragStart = (clientX: number) => {
    if (!sliderRef.current) return;
    setIsDraggingMax(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = 'touches' in moveEvent ? moveEvent.touches[0].clientX - rect.left : moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = Math.round((percentage / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE);
      // Prevent max from going below min (ensure max is at least 100k more than min)
      const newMax = Math.max(newValue, Math.min(MAX_PRICE, sliderMin + 100000));
      updatePrices(sliderMin, newMax, true); // Update inputs when dragging slider
    };
    
    const handleEnd = () => {
      setIsDraggingMax(false);
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove as EventListener, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  const getDisplayText = () => {
    if (!value || value === `${MIN_PRICE}-${MAX_PRICE}`) {
      return 'Any price';
    }
    const minText = sliderMin !== MIN_PRICE ? `₹ ${sliderMin.toLocaleString()}` : 'No Min';
    const maxText = sliderMax !== MAX_PRICE ? `₹ ${sliderMax.toLocaleString()}` : 'No Max';
    return `${minText} - ${maxText}`;
  };

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
            color={value && value !== `${MIN_PRICE}-${MAX_PRICE}` ? 'gray.900' : 'gray.500'}
            noOfLines={1}
            fontFamily="'Playfair Display', serif"
            letterSpacing="0.01em"
          >
            {getDisplayText()}
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
                p={4}
                minW={{ base: '280px', md: '380px' }}
                maxW={{ base: 'calc(100vw - 32px)', md: '420px' }}
                w={{ base: 'auto', md: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
            <VStack spacing={4} align="stretch">
            {/* Range Slider */}
            <Box>
              <Box
                ref={sliderRef}
                position="relative"
                h="8px"
                bg="gray.200"
                borderRadius="full"
                cursor="pointer"
                onClick={handleSliderClick}
                userSelect="none"
                mt={2}
              >
                {/* Filled track between handles */}
                <Box
                  position="absolute"
                  left={`${getSliderPosition(sliderMin)}%`}
                  right={`${100 - getSliderPosition(sliderMax)}%`}
                  h="100%"
                  bg="gray.600"
                  borderRadius="full"
                  zIndex={1}
                />
                
                {/* Min handle */}
                <Box
                  data-handle="min"
                  position="absolute"
                  left={`${getSliderPosition(sliderMin)}%`}
                  transform="translateX(-50%)"
                  w="20px"
                  h="20px"
                  bg="gray.900"
                  borderRadius="full"
                  border="2px solid white"
                  boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  cursor={isDraggingMin ? 'grabbing' : 'grab'}
                  zIndex={2}
                  top="50%"
                  mt="-10px"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMinDragStart(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.touches[0]) {
                      handleMinDragStart(e.touches[0].clientX);
                    }
                  }}
                  transition={isDraggingMin ? 'none' : 'all 0.1s'}
                  _hover={{
                    transform: 'translateX(-50%) scale(1.1)',
                  }}
                />
                
                {/* Max handle */}
                <Box
                  data-handle="max"
                  position="absolute"
                  left={`${getSliderPosition(sliderMax)}%`}
                  transform="translateX(-50%)"
                  w="20px"
                  h="20px"
                  bg="gray.900"
                  borderRadius="full"
                  border="2px solid white"
                  boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  cursor={isDraggingMax ? 'grabbing' : 'grab'}
                  zIndex={2}
                  top="50%"
                  mt="-10px"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMaxDragStart(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.touches[0]) {
                      handleMaxDragStart(e.touches[0].clientX);
                    }
                  }}
                  transition={isDraggingMax ? 'none' : 'all 0.1s'}
                  _hover={{
                    transform: 'translateX(-50%) scale(1.1)',
                  }}
                />
              </Box>
            </Box>

            {/* Min/Max Input Fields */}
            <HStack spacing={3} mt={2}>
              <Box flex={1} position="relative">
                <HStack
                  spacing={2}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  px={3}
                  py={2}
                  bg="white"
                  _focusWithin={{
                    borderColor: 'gray.900',
                    boxShadow: '0 0 0 1px gray.900',
                  }}
                >
                  <Text fontSize="sm" color="gray.700" fontWeight="500">
                    ₹
                  </Text>
                  <Input
                    placeholder="No Min"
                    value={minPriceInput}
                    onChange={handleMinInputChange}
                    border="none"
                    p={0}
                    h="auto"
                    fontSize="sm"
                    color="gray.900"
                    _focus={{ boxShadow: 'none' }}
                    _placeholder={{ color: 'gray.400' }}
                    type="text"
                    inputMode="numeric"
                  />
                  {minPriceInput && (
                    <IconButton
                      aria-label="Clear min"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      onClick={clearMin}
                      minW="auto"
                      w="16px"
                      h="16px"
                      color="gray.500"
                      _hover={{ color: 'gray.900', bg: 'transparent' }}
                    />
                  )}
                </HStack>
              </Box>
              <Box flex={1} position="relative">
                <HStack
                  spacing={2}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  px={3}
                  py={2}
                  bg="white"
                  _focusWithin={{
                    borderColor: 'gray.900',
                    boxShadow: '0 0 0 1px gray.900',
                  }}
                >
                  <Text fontSize="sm" color="gray.700" fontWeight="500">
                    ₹
                  </Text>
                  <Input
                    placeholder="No Max"
                    value={maxPriceInput}
                    onChange={handleMaxInputChange}
                    border="none"
                    p={0}
                    h="auto"
                    fontSize="sm"
                    color="gray.900"
                    _focus={{ boxShadow: 'none' }}
                    _placeholder={{ color: 'gray.400' }}
                    type="text"
                    inputMode="numeric"
                  />
                  {maxPriceInput && (
                    <IconButton
                      aria-label="Clear max"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      onClick={clearMax}
                      minW="auto"
                      w="16px"
                      h="16px"
                      color="gray.500"
                      _hover={{ color: 'gray.900', bg: 'transparent' }}
                    />
                  )}
                </HStack>
              </Box>
            </HStack>
          </VStack>
              </Box>
            )}
          </Portal>
        </>
      )}
    </Box>
  );
};

export default PriceRangeSelector;

