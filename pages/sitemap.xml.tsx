import { GetServerSideProps } from 'next';
import { supabase } from '@/lib/supabase';

function generateSiteMap(pages: Array<{ url: string; lastmod: string; changefreq: string; priority: string }>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
     http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
     ${pages
       .map((page) => {
         return `
       <url>
           <loc>${page.url}</loc>
           <lastmod>${page.lastmod}</lastmod>
           <changefreq>${page.changefreq}</changefreq>
           <priority>${page.priority}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sowparnikaproperties.com';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages - Focus on main pages for SEO
  const staticPages = [
    {
      url: `${siteUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      url: `${siteUrl}/properties`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      url: `${siteUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  // Dynamic property pages
  let propertyPages: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, updated_at, status')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1000); // Limit to 1000 most recent properties

      if (!error && properties) {
        propertyPages = properties.map((property) => ({
          url: `${siteUrl}/properties/${property.id}`,
          lastmod: property.updated_at 
            ? new Date(property.updated_at).toISOString().split('T')[0]
            : currentDate,
          changefreq: 'weekly',
          priority: '0.7',
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  // Combine all pages
  const allPages = [...staticPages, ...propertyPages];

  // Generate the XML sitemap
  const sitemap = generateSiteMap(allPages);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;

