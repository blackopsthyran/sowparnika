import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Simple password hashing function (using Node.js crypto)
// In production, use bcryptjs or argon2 for better security
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
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          username: !username,
          email: !email,
          password: !password,
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({ error: 'Failed to check existing user' });
    }

    if (existingUser && existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser[0].username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash,
          user_type: 'user',
        },
      ])
      .select('id, username, email, user_type')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({ error: 'Failed to create user', details: insertError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.user_type,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Failed to register user',
      message: error.message || 'Unknown error occurred',
    });
  }
}

