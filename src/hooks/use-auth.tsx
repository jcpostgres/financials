'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  role: Role;
  isLoggedIn: boolean;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole && storedRole !== 'unauthenticated') {
        setRole(storedRole);
      } else {
        setRole('unauthenticated');
      }
    } catch (error) {
      setRole('unauthenticated');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newRole: Role) => {
    if (newRole !== 'admin' && newRole !== 'recepcionista') return;
    try {
      localStorage.setItem('userRole', newRole);
    } catch (error) {
       console.error("Could not save role to localStorage", error);
    }
    setRole(newRole);
    router.push(newRole === 'admin' ? '/dashboard' : '/pos');
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('userRole');
    } catch (error) {
        console.error("Could not remove role from localStorage", error);
    }
    setRole('unauthenticated');
    router.push('/login');
  }, [router]);

  const value = {
    role,
    isLoggedIn: role !== 'unauthenticated' && role !== 'loading',
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
