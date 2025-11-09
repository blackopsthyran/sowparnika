import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Simple password hashing function (using Node.js crypto)
// In production, use bcryptjs or argon2 for better security
import crypto from 'crypto';

const hashPassword = (password: string): string => {
  // Using Node.js crypto module for hashing
  const salt = 'real-estate-salt-v1'; // In production, use a unique salt per user
  return crypto.createHash('sha256').update(password + salt).digest('hex');
};

const verifyPassword = (password: string, hash: string): boolean => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Check for admin login first
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      // Admin login
      return res.status(200).json({
        success: true,
        user: {
          id: 'admin',
          username: 'Admin',
          email: adminEmail,
          userType: 'admin',
        },
        isAdmin: true,
      });
    }

    // Regular user login - check database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password_hash, user_type')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.user_type,
      },
      isAdmin: false,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Failed to login',
      message: error.message || 'Unknown error occurred',
    });
  }
}

