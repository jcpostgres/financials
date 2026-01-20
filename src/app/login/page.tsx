'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, User, UserCog, Lock } from 'lucide-react';
import type { Role } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppState } from '@/hooks/use-app-state';

type Location = 'MAGALLANES' | 'SARRIAS' | 'PSYFN';
type Step = 'location' | 'role' | 'password';


export default function LoginScreen() {
  const [step, setStep] = useState<Step>('location');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [password, setPassword] = useState('');
  
  const { login, isLoading: authIsLoading } = useAuth();
  const { appSettings } = useAppState();
  const { toast } = useToast();

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setStep('role');
  };
  
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setStep('password');
    } else {
      if (!selectedLocation) return;
      login(role, selectedLocation);
    }
  };

  const handlePasswordSubmit = () => {
    if (!selectedLocation || !selectedRole) return;
    
    if (password === appSettings.password) {
        login(selectedRole, selectedLocation);
    } else {
        toast({
            title: 'Error de Autenticación',
            description: 'La contraseña es incorrecta.',
            variant: 'destructive'
        });
        setPassword('');
    }
  };
  
  const resetState = () => {
      setStep('location');
      setSelectedLocation(null);
      setSelectedRole(null);
      setPassword('');
  };

  const getTitle = () => {
      switch(step) {
          case 'location':
              return 'Seleccione su sede para continuar';
          case 'role':
              return `Sede ${selectedLocation}. Seleccione su rol:`;
          case 'password':
              return `Sede ${selectedLocation} (Admin). Ingrese la contraseña:`;
          default:
              return 'Bienvenido';
      }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            NORDICO POS
          </CardTitle>
          <CardDescription>
            {getTitle()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'location' && (
            <div className="space-y-4">
              <Button onClick={() => handleLocationSelect('MAGALLANES')} className="w-full" size="lg">
                <Building className="mr-2 h-5 w-5" /> MAGALLANES
              </Button>
              <Button onClick={() => handleLocationSelect('SARRIAS')} className="w-full" size="lg">
                <Building className="mr-2 h-5 w-5" /> SARRIAS
              </Button>
              <Button onClick={() => handleLocationSelect('PSYFN')} className="w-full" size="lg">
                <Building className="mr-2 h-5 w-5" /> PSYFN
              </Button>
            </div>
          )}
          
          {step === 'role' && (
            <div className="space-y-4">
              <Button onClick={() => handleRoleSelect('admin')} className="w-full" size="lg">
                <UserCog className="mr-2 h-5 w-5" /> Administrador
              </Button>
              <Button onClick={() => handleRoleSelect('recepcionista')} className="w-full" size="lg">
                <User className="mr-2 h-5 w-5" /> Recepcionista
              </Button>
              <Button variant="link" onClick={resetState} className="w-full">
                Cambiar de sede
              </Button>
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password"><Lock className="inline mr-2"/>Contraseña</Label>
                <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
              </div>
               <Button type="submit" className="w-full" size="lg" disabled={authIsLoading}>
                Ingresar
              </Button>
               <Button variant="link" onClick={() => setStep('role')} className="w-full">
                Cambiar de rol
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
