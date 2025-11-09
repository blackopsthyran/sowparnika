import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  userType: 'user' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
      const userSession = Cookies.get('user_session');
      if (userSession) {
        try {
          const userData = JSON.parse(userSession);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.userType === 'admin');
        } catch (e) {
          // Legacy admin session
          const adminSession = Cookies.get('admin_session');
          if (adminSession) {
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
            setUser({
              id: 'admin',
              username: 'Admin',
              email: adminEmail,
              userType: 'admin',
            });
            setIsAuthenticated(true);
            setIsAdmin(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setIsAdmin(false);
          }
        }
      } else {
        // Check for legacy admin session
        const adminSession = Cookies.get('admin_session');
        if (adminSession) {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
          setUser({
            id: 'admin',
            username: 'Admin',
            email: adminEmail,
            userType: 'admin',
          });
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.userType === 'admin');
        
        // Store user session in cookie
        Cookies.set('user_session', JSON.stringify(data.user), { expires: 7 });
        
        // For admin, also set legacy admin_session for backward compatibility
        if (data.isAdmin) {
          Cookies.set('admin_session', 'authenticated', { expires: 7 });
        }
        
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Auto-login after registration
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.userType === 'admin');
        
        // Store user session in cookie
        Cookies.set('user_session', JSON.stringify(data.user), { expires: 7 });
        
        return { success: true };
      } else {
        console.error('Registration failed:', data.error);
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    Cookies.remove('user_session');
    Cookies.remove('admin_session');
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, isAdmin, login, register, logout }}>
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

