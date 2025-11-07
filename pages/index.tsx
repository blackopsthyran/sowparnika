import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import HeroSection from '@/features/Home/components/HeroSection/HeroSection';
import PropertyCarousel from '@/features/Home/components/PropertyCarousel/PropertyCarousel';
import Marquee from '@/features/Home/components/Marquee/Marquee';
import MeetTheTeam from '@/features/Home/components/MeetTheTeam';
import Partners from '@/features/Home/components/Partners';
import Testimonials from '@/features/Home/components/Testimonials';
import DefaultLayout from '@/features/Layout/DefaultLayout';

export default function Home() {
  const [trendingProperties, setTrendingProperties] = useState<any[]>([]);
  const [newProperties, setNewProperties] = useState<any[]>([]);
  const [popularProperties, setPopularProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      // Fetch trending properties (most recent active)
      const trendingResponse = await fetch('/api/get-properties?status=active&limit=10&sortBy=created_at&sortOrder=desc');
      const trendingData = await trendingResponse.json();

      // Fetch new properties (recently added)
      const newResponse = await fetch('/api/get-properties?status=active&limit=10&sortBy=created_at&sortOrder=desc');
      const newData = await newResponse.json();

      // Fetch popular properties (could be by views or random for now)
      const popularResponse = await fetch('/api/get-properties?status=active&limit=10');
      const popularData = await popularResponse.json();

      if (trendingResponse.ok && trendingData.properties) {
        const transformed = trendingData.properties.map((property: any) => ({
          ...property,
          images: Array.isArray(property.images) ? property.images : [],
        }));
        setTrendingProperties(transformed);
      }

      if (newResponse.ok && newData.properties) {
        const transformed = newData.properties.map((property: any) => ({
          ...property,
          images: Array.isArray(property.images) ? property.images : [],
        }));
        setNewProperties(transformed);
      }

      if (popularResponse.ok && popularData.properties) {
        const transformed = popularData.properties.map((property: any) => ({
          ...property,
          images: Array.isArray(property.images) ? property.images : [],
        }));
        setPopularProperties(transformed);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout
      title="Sowparnika Properties"
      description='Sowparnika Properties - Your trusted gateway to real estate in Kakkanad, Kochi. Find verified properties, expert consultation, and full-service support for buying, renting, or investing in quality real estate.'
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
        
        {/* Trending Properties */}
        {!loading && trendingProperties.length > 0 && (
          <Box bg="white">
            <PropertyCarousel
              title="Trending"
              description="Discover the homes that are capturing attention in the market. This curated selection showcases the most sought-after properties available right now."
              properties={trendingProperties}
              viewAllLink="/properties?sortBy=created_at&sortOrder=desc"
            />
          </Box>
        )}

        {/* Divider */}
        {trendingProperties.length > 0 && newProperties.length > 0 && (
          <Box h="1px" bg="gray.200" />
        )}

        {/* New To The Market */}
        {!loading && newProperties.length > 0 && (
          <Box bg="gray.50">
            <PropertyCarousel
              title="New To The Market"
              properties={newProperties}
              viewAllLink="/properties?sortBy=created_at&sortOrder=desc"
            />
          </Box>
        )}

        {/* Homes You'll Love */}
        {!loading && popularProperties.length > 0 && (
          <Box bg="white">
            <PropertyCarousel
              title="Homes You'll Love"
              properties={popularProperties}
              viewAllLink="/properties"
            />
          </Box>
        )}

        <MeetTheTeam />
        <Partners />
        <Testimonials />
      </Box>
    </DefaultLayout>
  );
}
