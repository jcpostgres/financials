
'use client'

import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { LocationData } from '@/hooks/use-app-state';

function SedesProfitCard({ title, netProfit }: { title: string, netProfit: number }) {
  const franchiseeProfit = netProfit * 0.5 * 0.6;
  const partnersPool = netProfit * 0.5 * 0.4;
  const partnersProfit = partnersPool * 0.6;

  const partners = [
    { name: 'Engel', share: 33.3 },
    { name: 'Roy', share: 33.3 },
    { name: 'Katherine', share: 33.3 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Ganancia Neta del Período: {formatCurrency(netProfit)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Ganancia Neta de Socios: {formatCurrency(partnersProfit)}</h3>
          <p className="text-sm text-muted-foreground">(Corresponde al 60% del pozo de socios)</p>
        </div>
        <div>
            <h3 className="font-semibold">Ganancia de Franquiciado: {formatCurrency(franchiseeProfit)}</h3>
        </div>
        <div>
          <h3 className="font-semibold">Desglose por Socio:</h3>
          <ul className="space-y-2 mt-2">
            {partners.map(p => (
              <li key={p.name} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><User />{p.name} ({p.share}%)</span>
                <span className="font-semibold">{formatCurrency(partnersProfit * (p.share / 100))}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalGeneralCard({ magallanesData, sarriasData, psyfnData }: { magallanesData?: LocationData, sarriasData?: LocationData, psyfnData?: LocationData }) {
    const calculateAnnualProfit = (data?: LocationData) => {
        if (!data) return 0;
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        const yearlyIncome = data.transactions.filter(tx => tx.endTime >= startOfYear && tx.endTime <= endOfYear).reduce((sum, tx) => sum + tx.totalAmount, 0);
        const yearlyExpenses = data.expenses.filter(exp => exp.timestamp >= startOfYear && exp.timestamp <= endOfYear).reduce((sum, exp) => sum + exp.amount, 0);
        return yearlyIncome - yearlyExpenses;
    };
    
    const magallanesProfit = calculateAnnualProfit(magallanesData);
    const sarriasProfit = calculateAnnualProfit(sarriasData);
    const psyfnProfit = calculateAnnualProfit(psyfnData);

    const magallanesPartnersProfit = magallanesProfit * 0.5 * 0.4 * 0.6;
    const sarriasPartnersProfit = sarriasProfit * 0.5 * 0.4 * 0.6;
    const psyfnPartnersProfit = psyfnProfit * 0.5;

    const totalPartnersProfit = magallanesPartnersProfit + sarriasPartnersProfit + psyfnPartnersProfit;

    const partners = [
        { name: 'Engel', share: 33.3 },
        { name: 'Roy', share: 33.3 },
        { name: 'Katherine', share: 33.3 },
    ];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Total General de Ganancias de Socios</CardTitle>
                <CardDescription>Suma de Magallanes, Sarrias y Planta</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold mb-4">{formatCurrency(totalPartnersProfit)}</p>
                <h3 className="font-semibold mb-2">Desglose Total por Socio:</h3>
                <ul className="space-y-2">
                    {partners.map(p => (
                      <li key={p.name} className="flex items-center justify-between p-3 bg-muted rounded-lg text-base">
                        <span className="flex items-center gap-2 font-medium"><User />{p.name} ({p.share}%)</span>
                        <span className="font-bold text-primary">{formatCurrency(totalPartnersProfit * (p.share / 100))}</span>
                      </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function SedesPage() {
  const searchParams = useSearchParams();
  const sede = searchParams.get('sede') || 'MAGALLANES';

  const [allData, setAllData] = useState<Record<string, LocationData> | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('nordicoAppData');
    if (storedData) {
        setAllData(JSON.parse(storedData, (key, value) => {
            if (['startTime', 'endTime', 'timestamp', 'createdAt'].includes(key)) {
                return new Date(value);
            }
            return value;
        }));
    }
  }, []);

  if (!allData) return <div>Cargando...</div>;

  if (sede === 'TOTAL') {
      return (
           <div>
              <PageHeader title="Reporte de Sedes" description="Análisis de ganancias por sede." />
              <TotalGeneralCard magallanesData={allData['MAGALLANES']} sarriasData={allData['SARRIAS']} psyfnData={allData['PSYFN']} />
           </div>
      )
  }

  const selectedSedeData = allData[sede];
  if (!selectedSedeData) return <div>No se encontraron datos para la sede {sede}</div>;

  const netProfit = selectedSedeData.transactions.reduce((sum, tx) => sum + tx.totalAmount, 0) - selectedSedeData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div>
      <PageHeader title="Reporte de Sedes" description={`Análisis de ganancias para ${sede}.`} />
      <div className="space-y-6">
        <SedesProfitCard title={`Distribución de Ganancias Netas (${sede})`} netProfit={netProfit} />
      </div>
    </div>
  );
}
