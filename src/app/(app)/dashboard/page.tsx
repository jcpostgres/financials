'use client';

import { useAppState } from '@/hooks/use-app-state';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/common/page-header';
import { TrendingUp, Clock, Users, Calendar, BarChart, Landmark, BadgeDollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { LocationData } from '@/hooks/use-app-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function PsyfnDashboard() {
    const [allData, setAllData] = useState<Record<string, LocationData> | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
        // Set initial filter to this month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(startOfMonth.toISOString().split('T')[0]);
        setEndDate(endOfMonth.toISOString().split('T')[0]);
    }, []);

    const setFilterPreset = (preset: 'today' | 'month' | 'year') => {
        const today = new Date();
        let start, end;
        if (preset === 'today') {
            start = today;
            end = today;
        } else if (preset === 'month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else { // year
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    if (!allData) {
        return <div>Cargando datos de las sedes...</div>;
    }
    
    // Filtered calculations
    const psyfnData = allData['PSYFN'];
    const filteredTransactions = psyfnData?.transactions.filter(tx => {
      if (!startDate && !endDate) return true;
      const txDate = tx.endTime;
      const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    }) || [];
    const filteredExpenses = psyfnData?.expenses.filter(exp => {
      if (!startDate && !endDate) return true;
      const expDate = exp.timestamp;
      const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
      if (start && expDate < start) return false;
      if (end && expDate > end) return false;
      return true;
    }) || [];

    const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Annual calculations
    const calculateAnnualProfit = (data: LocationData | undefined) => {
        if (!data) return 0;
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        
        const yearlyIncome = data.transactions
            .filter(tx => tx.endTime >= startOfYear && tx.endTime <= endOfYear)
            .reduce((sum, tx) => sum + tx.totalAmount, 0);
        
        const yearlyExpenses = data.expenses
            .filter(exp => exp.timestamp >= startOfYear && exp.timestamp <= endOfYear)
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        return yearlyIncome - yearlyExpenses;
    };

    const magallanesProfit = calculateAnnualProfit(allData['MAGALLANES']);
    const sarriasProfit = calculateAnnualProfit(allData['SARRIAS']);
    const psyfnProfit = calculateAnnualProfit(allData['PSYFN']);

    const magallanesPartnersProfit = (magallanesProfit * 0.5 * 0.4 * 0.6);
    const sarriasPartnersProfit = (sarriasProfit * 0.5 * 0.4 * 0.6);
    const totalPartnersProfit = magallanesPartnersProfit + sarriasPartnersProfit;


    return (
        <div>
            <PageHeader title="INICIO" description="Resumen de ganancias por sede y socios." />
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Resumen de Planta</CardTitle>
                    <CardDescription>Filtre para ver ingresos, gastos y ganancias de la planta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><Label>Fecha Inicio:</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                        <div><Label>Fecha Fin:</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Button variant="outline" onClick={() => setFilterPreset('today')}>Hoy</Button>
                        <Button variant="outline" onClick={() => setFilterPreset('month')}>Este Mes</Button>
                        <Button variant="outline" onClick={() => setFilterPreset('year')}>Este Año</Button>
                        <Button variant="destructive" onClick={() => { setStartDate(''); setEndDate(''); }}>Limpiar</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader><CardTitle>Ingresos</CardTitle></CardHeader>
                            <CardContent className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Gastos</CardTitle></CardHeader>
                            <CardContent className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Ganancia Neta</CardTitle></CardHeader>
                            <CardContent className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen Anual</CardTitle>
                    <CardDescription>Ganancias anuales por sede y socios.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ganancia Anual Magallanes (Local)</CardTitle>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">{formatCurrency(magallanesProfit * 0.5 * 0.95)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ganancia Anual Sarrias (Local)</CardTitle>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">{formatCurrency(sarriasProfit * 0.5 * 0.95)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ganancia Anual Planta</CardTitle>
                                <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">{formatCurrency(psyfnProfit)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ganancia Anual Socios (Total)</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">{formatCurrency(totalPartnersProfit)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DashboardPage() {
  const { location } = useAuth();
  const { transactions, activeTickets, barberTurnQueue, expenses } = useAppState();

  if (location === 'PSYFN') {
    return <PsyfnDashboard />;
  }

  const today = new Date();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  
  const salesToday = transactions
    .filter(tx => tx.endTime && new Date(tx.endTime) >= startOfDay)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const activeServicesCount = activeTickets.length;
  const activeBarbersCount = barberTurnQueue.length;

  const currentYear = today.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const yearlyIncome = transactions
    .filter(tx => tx.endTime >= startOfYear && tx.endTime <= endOfYear)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const yearlyExpenses = expenses
    .filter(exp => exp.timestamp >= startOfYear && exp.timestamp <= endOfYear)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const yearlyProfit = yearlyIncome - yearlyExpenses;

  return (
    <div>
      <PageHeader
        title="PANEL GENERAL"
        description="Vista general del rendimiento de la barbería."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(salesToday)}</div>
            <p className="text-xs text-muted-foreground">Ingresos totales registrados hoy.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{activeServicesCount}</div>
            <p className="text-xs text-muted-foreground">Clientes siendo atendidos actualmente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barberos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{activeBarbersCount}</div>
            <p className="text-xs text-muted-foreground">Barberos actualmente en la cola de turnos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias del Año</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${yearlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(yearlyProfit)}</div>
            <p className="text-xs text-muted-foreground">Ganancia neta en {currentYear}.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
