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
import { Building, LogIn, User, UserCog } from 'lucide-react';
import type { Role } from '@/lib/types';

type Location = 'MAGALLANES' | 'SARRIAS' | 'PSYFN';

export default function LoginScreen() {
  const [step, setStep] = useState<'location' | 'role'>('location');
  const [location, setLocation] = useState<Location | null>(
    null
  );
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
    if (selectedLocation === 'PSYFN') {
        handleRoleSelect('admin', selectedLocation);
    } else {
        setStep('role');
    }
  };

  const handleRoleSelect = (role: Role, selectedLocation?: Location) => {
    const loginLocation = selectedLocation || location;
    if (!loginLocation) return;
    
    login(role, loginLocation);
    toast({
      title: 'Éxito',
      description: `Inicio de sesión como ${
        role === 'admin' ? 'Administrador' : 'Recepcionista'
      } en ${loginLocation}.`,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            NORDICO POS
          </CardTitle>
          <CardDescription>
            {step === 'location'
              ? 'Seleccione su sede para continuar'
              : `Sede ${location}. Seleccione su rol:`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'location' ? (
            <div className="space-y-4">
              <Button
                onClick={() => handleLocationSelect('MAGALLANES')}
                className="w-full"
                size="lg"
              >
                <Building className="mr-2 h-5 w-5" />
                MAGALLANES
              </Button>
              <Button
                onClick={() => handleLocationSelect('SARRIAS')}
                className="w-full"
                size="lg"
              >
                <Building className="mr-2 h-5 w-5" />
                SARRIAS
              </Button>
              <Button
                onClick={() => handleLocationSelect('PSYFN')}
                className="w-full"
                size="lg"
              >
                <Building className="mr-2 h-5 w-5" />
                PSYFN
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => handleRoleSelect('admin' as Role)}
                className="w-full"
                size="lg"
              >
                <UserCog className="mr-2 h-5 w-5" />
                Administrador
              </Button>
              <Button
                onClick={() => handleRoleSelect('recepcionista' as Role)}
                className="w-full"
                size="lg"
              >
                <User className="mr-2 h-5 w-5" />
                Recepcionista
              </Button>
              <Button
                variant="link"
                onClick={() => setStep('location')}
                className="w-full"
              >
                Cambiar de sede
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
