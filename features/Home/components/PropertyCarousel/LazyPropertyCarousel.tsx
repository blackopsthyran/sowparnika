import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper';
import { Box, IconButton, HStack, Heading, Text, Button, Flex, Spinner, Center } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import PropertyCard from '@/features/common/modules/PropertyCard';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';

interface LazyPropertyCarouselProps {
  title: string;
  description?: string;
  fetchUrl: string;
  viewAllLink?: string;
  showViewAll?: boolean;
  autoplay?: boolean;
  initialLimit?: number;
  loadMoreLimit?: number;
}

const LazyPropertyCarousel: React.FC<LazyPropertyCarouselProps> = ({
  title,
  description,
  fetchUrl,
  viewAllLink = '/properties',
  showViewAll = true,
  autoplay = true,
  initialLimit = 6,
  loadMoreLimit = 6,
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [swiper, setSwiper] = useState<any>(null);

  // Refs for stable values that don't trigger re-renders
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchUrlRef = useRef(fetchUrl);
  const loadMoreLimitRef = useRef(loadMoreLimit);
  const hasMoreRef = useRef(true);
  const lastLoadTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const observerSetupRef = useRef(false); // Track if observer has been set up
  const propertiesLengthRef = useRef(0); // Track properties length without re-renders

  // Update refs when props change (doesn't cause re-renders)
  useEffect(() => {
    fetchUrlRef.current = fetchUrl;
    loadMoreLimitRef.current = loadMoreLimit;
  }, [fetchUrl, loadMoreLimit]);

  // Sync refs with state (without triggering effects)
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    propertiesLengthRef.current = properties.length;
  }, [properties.length]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (error) {
          // Ignore cleanup errors
        }
        observerRef.current = null;
      }
      observerSetupRef.current = false;
    };
  }, []);

  // Initial load - only run once
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadInitialProperties = async () => {
      try {
        setLoading(true);
        const url = new URL(fetchUrlRef.current, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        url.searchParams.set('limit', initialLimit.toString());
        url.searchParams.set('page', '1');

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (!isMountedRef.current) return;

        if (data.properties && Array.isArray(data.properties)) {
          const transformed = data.properties.map((property: any) => ({
            ...property,
            images: Array.isArray(property.images) ? property.images : [],
          }));

          setProperties(transformed);
          propertiesLengthRef.current = transformed.length;
          setTotal(data.total || 0);
          const stillHasMore = (data.total || 0) > transformed.length;
          setHasMore(stillHasMore);
          hasMoreRef.current = stillHasMore;
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        if (isMountedRef.current) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialProperties();
  }, [initialLimit]);

  // Load more properties - completely stable callback
  const loadMoreProperties = useCallback(async () => {
    // Prevent rapid fire - critical for iOS (3 second minimum)
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 3000) {
      return;
    }
    lastLoadTimeRef.current = now;

    // Check conditions using refs
    if (isLoadingRef.current || !hasMoreRef.current || !isMountedRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoadingMore(true);

    try {
      // Get next page using functional update
      let nextPage = 1;
      setCurrentPage(prevPage => {
        nextPage = prevPage + 1;
        return nextPage;
      });

      const url = new URL(fetchUrlRef.current, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      url.searchParams.set('limit', loadMoreLimitRef.current.toString());
      url.searchParams.set('page', nextPage.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();

      if (!isMountedRef.current) {
        isLoadingRef.current = false;
        return;
      }

      if (data.properties && Array.isArray(data.properties) && data.properties.length > 0) {
        const transformed = data.properties.map((property: any) => ({
          ...property,
          images: Array.isArray(property.images) ? property.images : [],
        }));

        // Single batched state update
        setProperties(prev => {
          const newProperties = [...prev, ...transformed];
          propertiesLengthRef.current = newProperties.length;
          const newTotal = data.total || newProperties.length;
          const stillHasMore = newProperties.length < newTotal;

          // Update all related state and refs together
          hasMoreRef.current = stillHasMore;
          setTotal(newTotal);
          setHasMore(stillHasMore);
          setCurrentPage(nextPage);

          return newProperties;
        });
      } else {
        // No more properties
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more properties:', error);
      if (isMountedRef.current) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      isLoadingRef.current = false;
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, []); // Empty deps - all values from refs or functional updates

  // Detect iOS to apply more conservative settings
  const isIOSRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isIOSRef.current = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
  }, []);

  // Set up Intersection Observer ONLY ONCE after initial load completes
  // This observer will NOT be recreated when properties change (critical for iOS)
  useEffect(() => {
    // Only set up observer once, after initial load is complete and we have properties
    if (observerSetupRef.current || loading || properties.length === 0) {
      return;
    }

    // Don't set up if no more data
    if (!hasMoreRef.current) {
      return;
    }

    const currentRef = loadMoreRef.current;
    if (!currentRef || !isMountedRef.current) {
      return;
    }

    // Longer delay for iOS to ensure everything is stable
    const delay = isIOSRef.current ? 2000 : 1000;
    const setupTimeout = setTimeout(() => {
      // Double-check conditions after delay
      if (!currentRef || !isMountedRef.current || observerSetupRef.current || !hasMoreRef.current) {
        return;
      }

      // Very aggressive debouncing for iOS
      let lastTriggerTime = 0;
      const MIN_INTERVAL_MS = isIOSRef.current ? 8000 : 3000; // 8 seconds on iOS to prevent reloads, 3 seconds elsewhere
      let isProcessing = false;
      let triggerCount = 0;
      const MAX_TRIGGERS = 5; // Reduced limit for iOS to prevent crashes

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Early returns - use refs to avoid state reads
          if (!isMountedRef.current || isProcessing) return;
          if (triggerCount >= MAX_TRIGGERS) {
            console.warn('Max triggers reached, disabling observer');
            if (observerRef.current) {
              try {
                observerRef.current.disconnect();
              } catch (error) {
                // Ignore
              }
            }
            return;
          }

          const [entry] = entries;
          if (!entry.isIntersecting) return;

          const now = Date.now();

          // Very strict debounce for iOS
          if (now - lastTriggerTime < MIN_INTERVAL_MS) {
            return;
          }

          // Don't load more if user is zoomed in (prevent issues during pinch-zoom)
          if (window.visualViewport && window.visualViewport.scale > 1.1) {
            return;
          }

          // Final check using refs only (no state reads)
          if (!hasMoreRef.current || isLoadingRef.current || isProcessing) {
            return;
          }

          // Increment trigger count and set flags
          triggerCount++;
          isProcessing = true;
          lastTriggerTime = now;

          // Immediately disconnect to prevent any further triggers
          if (observerRef.current) {
            try {
              observerRef.current.disconnect();
            } catch (error) {
              // Ignore errors
            }
          }

          // Use requestAnimationFrame to batch state updates (iOS optimization)
          requestAnimationFrame(() => {
            // Load more properties
            loadMoreProperties()
              .then(() => {
                // Wait before re-enabling (longer wait on iOS)
                const reEnableDelay = isIOSRef.current ? 4000 : 2500;
                setTimeout(() => {
                  isProcessing = false;

                  // Only re-enable if all conditions are met
                  if (
                    isMountedRef.current &&
                    hasMoreRef.current &&
                    currentRef &&
                    observerRef.current &&
                    triggerCount < MAX_TRIGGERS
                  ) {
                    try {
                      observerRef.current.observe(currentRef);
                    } catch (error) {
                      console.error('Error re-observing:', error);
                      isProcessing = false;
                    }
                  } else {
                    // Cleanup if conditions not met
                    if (observerRef.current) {
                      try {
                        observerRef.current.disconnect();
                      } catch (error) {
                        // Ignore
                      }
                    }
                  }
                }, reEnableDelay);
              })
              .catch((error) => {
                console.error('Error in loadMoreProperties:', error);
                isProcessing = false;

                // Disable on error to prevent loops
                if (isMountedRef.current) {
                  hasMoreRef.current = false;
                  setHasMore(false);
                }

                // Cleanup observer on error
                if (observerRef.current) {
                  try {
                    observerRef.current.disconnect();
                  } catch (error) {
                    // Ignore
                  }
                }
              });
          });
        },
        {
          // Very conservative settings for iOS
          rootMargin: isIOSRef.current ? '800px' : '500px', // Load much earlier on iOS
          threshold: 0.01, // Very low threshold
        }
      );

      try {
        observerRef.current.observe(currentRef);
        observerSetupRef.current = true; // Mark as set up - will not be set up again
      } catch (error) {
        console.error('Error setting up IntersectionObserver:', error);
        observerSetupRef.current = false; // Allow retry on error
      }
    }, delay);

    return () => {
      clearTimeout(setupTimeout);
      // Don't disconnect observer in cleanup - let it persist until unmount or hasMore becomes false
    };
  }, [loading, loadMoreProperties]); // Only depend on loading (changes once) and stable callback

  // Cleanup observer when hasMore becomes false
  useEffect(() => {
    if (!hasMore && observerRef.current) {
      try {
        observerRef.current.disconnect();
        observerRef.current = null;
        observerSetupRef.current = false;
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }, [hasMore]);

  if (loading && properties.length === 0) {
    return (
      <Box py={12} px={{ base: 4, md: 8 }}>
        <Box maxW="1400px" margin="0 auto">
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        </Box>
      </Box>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <Box py={12} px={{ base: 4, md: 8 }}>
      <Box maxW="1400px" margin="0 auto">
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={8}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Box>
            <Heading
              size="xl"
              mb={2}
              fontWeight="bold"
              color="gray.800"
              fontFamily="'Playfair Display', serif"
            >
              {title}
            </Heading>
            {description && (
              <Text color="gray.600" fontSize="lg" maxW="600px" fontFamily="'Playfair Display', serif">
                {description}
              </Text>
            )}
          </Box>
          {showViewAll && (
            <HStack spacing={4}>
              <Link href={viewAllLink}>
                <Button variant="ghost" size="sm" colorScheme="blue" fontFamily="'Playfair Display', serif">
                  View all
                </Button>
              </Link>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => swiper?.slidePrev()}
                />
                <IconButton
                  aria-label="Next"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => swiper?.slideNext()}
                />
              </HStack>
            </HStack>
          )}
        </Flex>

        <Box
          sx={{
            '.property-carousel-swiper': {
              width: '100%',
              touchAction: 'pan-x pan-y', // Allow both horizontal and vertical panning
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              WebkitTapHighlightColor: 'transparent', // Remove tap highlight on iOS
              userSelect: 'none', // Prevent text selection during swipe
              '& .swiper-wrapper': {
                touchAction: 'pan-x pan-y',
              },
              '& .swiper-slide': {
                height: 'auto',
                display: 'flex',
                touchAction: 'pan-x pan-y', // Allow both directions
                WebkitTapHighlightColor: 'transparent',
              },
            },
          }}
        >
          <Swiper
            onSwiper={setSwiper}
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            autoplay={
              autoplay && properties.length > 1 && !isIOSRef.current
                ? {
                  delay: 3000,
                  disableOnInteraction: true, // Disable on touch to prevent conflicts
                  pauseOnMouseEnter: true,
                }
                : false
            }
            loop={false}
            navigation={false}
            className="property-carousel-swiper"
            watchSlidesProgress={true}
            touchEventsTarget="container"
            touchRatio={1}
            threshold={10}
            longSwipesRatio={0.5}
            followFinger={true}
            preventClicks={true}
            preventClicksPropagation={true}
            allowTouchMove={true}
            resistance={true}
            resistanceRatio={0.85}
            onTouchStart={(swiper, event) => {
              // Store initial touch position for iOS
              try {
                const touchEvent = event as TouchEvent;
                if (touchEvent.touches && touchEvent.touches.length === 1) {
                  const touch = touchEvent.touches[0];
                  (swiper as any).touchStartX = touch.clientX;
                  (swiper as any).touchStartY = touch.clientY;
                  (swiper as any).isScrolling = false;
                }
              } catch (error) {
                // Silently handle errors
              }
            }}
            onTouchMove={(swiper, event) => {
              // Better touch handling for iOS
              try {
                const touchEvent = event as TouchEvent;
                const swiperAny = swiper as any;
                if (touchEvent.touches && touchEvent.touches.length === 1 && swiperAny.touchStartX !== undefined && swiperAny.touchStartY !== undefined) {
                  const touch = touchEvent.touches[0];
                  const deltaX = Math.abs(touch.clientX - swiperAny.touchStartX);
                  const deltaY = Math.abs(touch.clientY - swiperAny.touchStartY);

                  // Determine if user is scrolling vertically or horizontally
                  if (deltaY > deltaX && deltaY > 15) {
                    // Vertical scroll - allow page scroll
                    swiperAny.isScrolling = true;
                  } else if (deltaX > deltaY && deltaX > 15) {
                    // Horizontal swipe - prevent page scroll
                    swiperAny.isScrolling = false;
                    if (isIOSRef.current) {
                      // On iOS, prevent default only for clear horizontal swipes
                      touchEvent.stopPropagation();
                    }
                  }
                }
              } catch (error) {
                // Silently handle errors
              }
            }}
            onTouchEnd={(swiper) => {
              // Clean up touch state
              try {
                const swiperAny = swiper as any;
                swiperAny.touchStartX = undefined;
                swiperAny.touchStartY = undefined;
                swiperAny.isScrolling = false;
              } catch (error) {
                // Silently handle errors
              }
            }}
            onSlideChange={() => {
              // Prevent any side effects during slide change
              try {
                // Small delay to ensure smooth transition
                if (isIOSRef.current) {
                  // On iOS, add a small delay to prevent conflicts
                  setTimeout(() => {
                    // Ensure observer doesn't trigger during slide change
                    if (observerRef.current && loadMoreRef.current) {
                      try {
                        observerRef.current.disconnect();
                        setTimeout(() => {
                          if (observerRef.current && loadMoreRef.current && hasMoreRef.current) {
                            observerRef.current.observe(loadMoreRef.current);
                          }
                        }, 500);
                      } catch (error) {
                        // Ignore errors
                      }
                    }
                  }, 300);
                }
              } catch (error) {
                // Silently handle errors
              }
            }}
          >
            {properties.map((property, index) => {
              const propertyId = property.id || property.externalID || `property-${index}`;
              return (
                <SwiperSlide key={propertyId} style={{ height: 'auto' }}>
                  <PropertyCard {...property} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Box>

        {/* Lazy load trigger - Only show when there are properties and more to load */}
        {properties.length > 0 && hasMore && (
          <Box
            ref={loadMoreRef}
            h="50px"
            mt={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {loadingMore && (
              <Spinner size="md" color="blue.500" thickness="3px" />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LazyPropertyCarousel;
