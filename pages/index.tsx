import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import HeroSection from '@/features/Home/components/HeroSection/HeroSection';
import Marquee from '@/features/Home/components/Marquee/Marquee';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import FeatureHighlights from '@/features/Home/components/FeatureHighlights/FeatureHighlights';
import WeeklyHighlight from '@/features/Home/components/WeeklyHighlight/WeeklyHighlight';
import PopularSearches from '@/features/Home/components/PopularSearches/PopularSearches';

// Lazy load heavy components
const LazyPropertyCarousel = dynamic(() => import('@/features/Home/components/PropertyCarousel/LazyPropertyCarousel'), {
  loading: () => <Box p={8} textAlign="center">Loading properties...</Box>,
  ssr: false,
});

const Partners = dynamic(() => import('@/features/Home/components/Partners'), {
  ssr: false,
});

const Testimonials = dynamic(() => import('@/features/Home/components/Testimonials'), {
  ssr: false,
});

export default function Home() {
  const [featuredProperty, setFeaturedProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch featured property for weekly highlight
    const fetchFeaturedProperty = async () => {
      try {
        const response = await fetch('/api/get-properties?status=active&featured=true&limit=1&sortBy=created_at&sortOrder=desc');
        const data = await response.json();
        
        if (response.ok && data.properties && data.properties.length > 0) {
          setFeaturedProperty(data.properties[0]);
        }
      } catch (error) {
        console.error('Error fetching featured property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperty();
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sowparnikaproperties.com';
  
  // Structured Data for Homepage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Sowparnika Properties',
    description: 'Your trusted gateway to real estate in Kakkanad, Kochi. Find verified properties, expert consultation, and full-service support for buying, renting, or investing in quality real estate.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/logo.png`,
    telephone: '+91 9446211417',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kakkanad',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
      postalCode: '682030'
    },
    areaServed: {
      '@type': 'City',
      name: 'Kakkanad, Kochi'
    },
    priceRange: '$$',
    sameAs: [
      'https://www.youtube.com/@sowparnikaproperties',
      'https://www.instagram.com/sowparnika.properties/'
    ]
  };

  return (
    <DefaultLayout
      title="Sowparnika Properties - Premium Real Estate in Kakkanad, Kochi | Buy, Rent, Invest"
      description="Sowparnika Properties - Your trusted gateway to real estate in Kakkanad, Kochi. Find verified properties, expert consultation, and full-service support for buying, renting, or investing in quality real estate. Browse houses, villas, flats, plots, and commercial buildings."
      keywords="real estate Kakkanad, properties Kochi, houses for sale Kakkanad, villas Kochi, flats Kakkanad, plots for sale, land Kakkanad, commercial buildings Kochi, property dealers Kakkanad, real estate agents Kochi, Sowparnika Properties"
      image="/logo.png"
      structuredData={structuredData}
    >
      <Box>
        <HeroSection />
        
        {/* Marquee */}
        <Marquee
          items={[
            'Luxury Properties',
            'Prime Locations',
            'Exclusive Listings',
            'World-Class Amenities',
            'Premium Real Estate',
            'Elite Properties',
            'Signature Homes',
            'Luxury Living',
            'Premium Investment',
            'Exclusive Estates',
            'Luxury Villas',
            'Prime Real Estate',
          ]}
          speed={40}
          direction="left"
        />

        {/* Feature Highlights */}
        <FeatureHighlights />
        
        {/* Featured Properties - Lazy Loaded */}
        <Box 
          bg="white"
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
          <LazyPropertyCarousel
            title="Featured Properties"
            description="Discover the homes that are capturing attention in the market. This curated selection showcases the most sought-after properties available right now."
            fetchUrl="/api/get-properties?status=active&featured=true&sortBy=created_at&sortOrder=desc"
            viewAllLink="/properties?featured=true&sortBy=created_at&sortOrder=desc"
            initialLimit={6}
            loadMoreLimit={6}
            autoplay={true}
          />
        </Box>

        {/* Divider */}
        <Box 
          h="1px" 
          bg="linear-gradient(to right, transparent, luxury.200, luxury.300, luxury.200, transparent)"
        />

        {/* Properties that You'll Love - Lazy Loaded */}
        <Box 
          bg="white"
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
          <LazyPropertyCarousel
            title="Properties that You'll Love"
            fetchUrl="/api/get-properties?status=active"
            viewAllLink="/properties"
            initialLimit={6}
            loadMoreLimit={6}
            autoplay={false}
          />
        </Box>

        {/* Weekly Highlight */}
        {!loading && featuredProperty && (
          <WeeklyHighlight property={featuredProperty} />
        )}

        {/* Popular Searches */}
        <PopularSearches />

        {/* Partners */}
        <Partners />
        
        {/* Testimonials */}
        <Testimonials />
      </Box>
    </DefaultLayout>
  );
}
