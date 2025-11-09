import Footer from '@/features/common/modules/Footer';
import Navigation from '@/features/common/modules/Navigation';
import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import Chatbot from '@/components/Chatbot/Chatbot';

interface DefaultLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  children,
  title = 'Sowparnika Properties - Premium Real Estate in Kakkanad, Kochi',
  description = 'Sowparnika Properties - Your trusted gateway to real estate in Kakkanad, Kochi. Find verified properties, expert consultation, and full-service support for buying, renting, or investing in quality real estate.',
  keywords = 'real estate, properties, Kakkanad, Kochi, houses, villas, flats, plots, land, commercial buildings, property for sale, property for rent, Sowparnika Properties',
  image = '/logo.png',
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sowparnikaproperties.com';
  const canonicalUrl = `${siteUrl}${router.asPath.split('?')[0]}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Sowparnika Properties" />
        <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Sowparnika Properties" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImageUrl} />
        <meta name="twitter:site" content="@SowparnikaProps" />
        <meta name="twitter:creator" content="@SowparnikaProps" />

        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="IN-KL" />
        <meta name="geo.placename" content="Kakkanad, Kochi" />
        <meta name="geo.position" content="9.9816;76.2999" />
        <meta name="ICBM" content="9.9816, 76.2999" />
        <meta name="contact" content="+91 9446211417" />
        <meta name="copyright" content="Sowparnika Properties" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />

        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sowparnika Properties" />

        {/* Structured Data (JSON-LD) */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      <Navigation />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
};

export default DefaultLayout;
