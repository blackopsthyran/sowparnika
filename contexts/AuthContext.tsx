import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Only check auth on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const session = Cookies.get('admin_session');
      if (session) {
        // If Supabase is configured, verify with Supabase
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
              setIsAuthenticated(true);
            } else {
              Cookies.remove('admin_session');
              setIsAuthenticated(false);
            }
          } catch (supabaseError) {
            // If Supabase check fails but session exists, allow access
            setIsAuthenticated(true);
          }
        } else {
          // Simple session check if Supabase is not configured
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      // Check credentials first
      if (email !== adminEmail || password !== adminPassword) {
        console.log('Invalid credentials provided');
        return false;
      }

      // Credentials match - proceed with authentication
      // If Supabase is configured, try Supabase auth (optional)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            // Supabase auth successful
            Cookies.set('admin_session', data.session?.access_token || 'authenticated', { expires: 7 });
            setIsAuthenticated(true);
            console.log('Login successful via Supabase');
            return true;
          } else {
            // Supabase auth failed - this is OK, we'll use simple session
            console.warn('Supabase auth failed (user may not exist in Supabase), using simple session:', error?.message);
          }
        } catch (supabaseError: any) {
          // Supabase error - fall back to simple session
          console.warn('Supabase auth error (this is OK if user doesn\'t exist in Supabase):', supabaseError?.message || supabaseError);
        }
      }
      
      // Simple session-based auth (works without Supabase or if Supabase auth fails)
      // This allows login even if the user doesn't exist in Supabase Auth
      Cookies.set('admin_session', 'authenticated', { expires: 7 });
      setIsAuthenticated(true);
      console.log('Login successful via simple session');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('admin_session');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

