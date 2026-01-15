'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

type Location = 'MAGALLANES' | 'SARRIAS' | 'PSYFN';

interface AuthContextType {
  role: Role;
  location: Location | null;
  isLoggedIn: boolean;
  login: (role: Role, location: Location) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>('loading');
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      const storedLocation = localStorage.getItem('userLocation') as Location;
      if (storedRole && storedRole !== 'unauthenticated' && storedLocation) {
        setRole(storedRole);
        setLocation(storedLocation);
      } else {
        setRole('unauthenticated');
        setLocation(null);
      }
    } catch (error) {
      setRole('unauthenticated');
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newRole: Role, newLocation: Location) => {
    if ((newRole !== 'admin' && newRole !== 'recepcionista') || !newLocation) return;
    try {
      localStorage.setItem('userRole', newRole);
      localStorage.setItem('userLocation', newLocation);
    } catch (error) {
       console.error("Could not save to localStorage", error);
    }
    setRole(newRole);
    setLocation(newLocation);
    router.push(newRole === 'admin' ? '/dashboard' : '/pos');
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userLocation');
    } catch (error) {
        console.error("Could not remove from localStorage", error);
    }
    setRole('unauthenticated');
    setLocation(null);
    router.push('/login');
  }, [router]);

  const value = {
    role,
    location,
    isLoggedIn: role !== 'unauthenticated' && role !== 'loading' && !!location,
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
