'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import type { Role } from '@/lib/types';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = () => {
    if (username === 'admin@nordico.com' && password === 'admin123') {
      login('admin' as Role);
      toast({ title: 'Éxito', description: 'Inicio de sesión como Administrador exitoso.' });
    } else if (username === 'recepcionista@nordico.com' && password === 'recep123') {
      login('recepcionista' as Role);
      toast({ title: 'Éxito', description: 'Inicio de sesión como Recepcionista exitoso.' });
    } else {
      toast({ title: 'Error', description: 'Credenciales incorrectas. Intente de nuevo.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Bienvenido a NORDICO POS</CardTitle>
          <CardDescription>Ingrese sus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario (Email)</Label>
              <Input
                type="email"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: recepcionista@nordico.com"
                onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
            </Button>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Credenciales de Prueba:</p>
            <p>Admin: <span className="font-bold text-primary">admin@nordico.com</span> / <span className="font-bold text-primary">admin123</span></p>
            <p>Recep: <span className="font-bold text-primary">recepcionista@nordico.com</span> / <span className="font-bold text-primary">recep123</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
