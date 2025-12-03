import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createServerSupabaseClient();

        // Fetch lightweight data for aggregation
        // Limit to 10000 to be safe, but should cover most use cases
        const { data, error } = await supabase
            .from('properties')
            .select('id, status, property_type, price, created_at')
            .range(0, 9999);

        if (error) throw error;

        const properties = data || [];

        // Calculate Stats
        const total = properties.length;
        const active = properties.filter(p => p.status === 'active').length;
        const sold = properties.filter(p => p.status === 'sold').length;
        const rented = properties.filter(p => p.status === 'rented').length;

        // Calculate Graphs Data

        // 1. Property Type Distribution
        const typeCount: Record<string, number> = {};
        properties.forEach(p => {
            // Normalize type (e.g. "Apartment" vs "apartment")
            const type = p.property_type ? p.property_type.trim() : 'Other';
            // Handle comma separated types if any
            const types = type.split(',').map((t: string) => t.trim());
            types.forEach((t: string) => {
                if (!t) return;
                // Capitalize
                const normalized = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
                typeCount[normalized] = (typeCount[normalized] || 0) + 1;
            });
        });

        const typeDistribution = Object.entries(typeCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value) // Sort by count desc
            .slice(0, 5); // Top 5 types

        // 2. Price Range Distribution
        const priceRanges = [
            { name: '< 50L', min: 0, max: 5000000, count: 0 },
            { name: '50L - 1Cr', min: 5000000, max: 10000000, count: 0 },
            { name: '1Cr - 5Cr', min: 10000000, max: 50000000, count: 0 },
            { name: '> 5Cr', min: 50000000, max: Infinity, count: 0 },
        ];

        properties.forEach(p => {
            const price = p.price || 0;
            const range = priceRanges.find(r => price >= r.min && price < r.max);
            if (range) range.count++;
        });

        const priceDistribution = priceRanges.map(r => ({ name: r.name, value: r.count }));

        return res.status(200).json({
            stats: { total, active, sold, rented },
            graphs: {
                typeDistribution,
                priceDistribution
            }
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ error: error.message });
    }
}
