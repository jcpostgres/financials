'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/componentsui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div>
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
    </div>
  );
}
