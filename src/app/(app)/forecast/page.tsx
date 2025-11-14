'use client';

import { useState } from 'react';
import { revenueForecast, type RevenueForecastOutput } from '@/ai/flows/revenue-forecasting';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TrendingUp, Archive, Users } from 'lucide-react';

export default function ForecastPage() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RevenueForecastOutput | null>(null);
  const [historicalData, setHistoricalData] = useState('{"January": 15000, "February": 17500, "March": 16000}');
  const [marketTrends, setMarketTrends] = useState('{"upcoming_holiday": "Father\'s Day", "local_events": "Music festival nearby"}');

  const handleForecast = async () => {
    setLoading(true);
    setResult(null);
    try {
      const forecastResult = await revenueForecast({ historicalData, marketTrends });
      setResult(forecastResult);
    } catch (error) {
      console.error('Error getting forecast:', error);
      // Here you would use a toast to show the error
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return <PageHeader title="Acceso Denegado" description="Esta sección es solo para administradores." />;
  }

  return (
    <div>
      <PageHeader title="Previsión de Ingresos con IA" description="Utiliza IA para analizar datos y predecir ingresos futuros." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos para el Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="historicalData">Datos Históricos de Ventas (JSON)</Label>
              <Textarea
                id="historicalData"
                value={historicalData}
                onChange={(e) => setHistoricalData(e.target.value)}
                rows={4}
                className="font-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketTrends">Tendencias del Mercado (JSON)</Label>
              <Textarea
                id="marketTrends"
                value={marketTrends}
                onChange={(e) => setMarketTrends(e.target.value)}
                rows={4}
                className="font-code"
              />
            </div>
            <Button onClick={handleForecast} disabled={loading} className="w-full">
              {loading ? 'Generando Previsión...' : 'Generar Previsión'}
            </Button>
          </CardContent>
        </Card>

        <div>
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
          )}
          {result && (
            <div className="space-y-4 animate-fade-in-up">
              <Card>
                <CardHeader className="flex-row items-center justify-between"><CardTitle>Previsión de Ingresos</CardTitle><TrendingUp/></CardHeader>
                <CardContent><p className="text-2xl font-bold text-primary">{result.revenueForecast}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-center justify-between"><CardTitle>Ajuste de Inventario Sugerido</CardTitle><Archive/></CardHeader>
                <CardContent><p>{result.suggestedInventoryAdjustment}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-center justify-between"><CardTitle>Ajuste de Personal Sugerido</CardTitle><Users/></CardHeader>
                <CardContent><p>{result.suggestedStaffingAdjustment}</p></CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
