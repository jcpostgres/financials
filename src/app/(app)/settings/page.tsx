'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function PasswordSettings() {
    const { appSettings, updatePassword } = useAppState();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { toast } = useToast();

    const handlePasswordChange = () => {
        if (currentPassword !== appSettings.password) {
            toast({ title: 'Error', description: 'La contraseña actual es incorrecta.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 4) {
            toast({ title: 'Error', description: 'La nueva contraseña debe tener al menos 4 caracteres.', variant: 'destructive' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: 'Error', description: 'Las nuevas contraseñas no coinciden.', variant: 'destructive' });
            return;
        }
        updatePassword(newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
         <Card className="max-w-lg">
            <CardHeader><CardTitle>Cambiar Contraseña de Administrador</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual:</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña:</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handlePasswordChange}>Cambiar Contraseña</Button>
            </CardContent>
        </Card>
    )
}


export default function SettingsPage() {
  const { appSettings, updateBcvRate } = useAppState();
  const { role } = useAuth();
  const [rate, setRate] = useState(appSettings.bcvRate);

  useEffect(() => {
    setRate(appSettings.bcvRate);
  }, [appSettings.bcvRate]);

  if (role !== 'admin') {
    return (
      <div>
        <PageHeader title="Acceso Denegado" description="Esta sección es solo para administradores." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Ajustes generales de la aplicación." />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Tasa de Cambio BCV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="bcvRate" className="whitespace-nowrap">1 USD =</Label>
            <Input
              id="bcvRate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-48"
              placeholder="Tasa en Bs."
            />
            <Label>Bs.</Label>
            <Button onClick={() => updateBcvRate(rate)}>Guardar</Button>
          </div>
        </CardContent>
      </Card>

      <PasswordSettings />

    </div>
  );
}
