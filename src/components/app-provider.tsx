'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { AppStateProvider } from '@/hooks/use-app-state';
import type React from 'react';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </AuthProvider>
  );
}
