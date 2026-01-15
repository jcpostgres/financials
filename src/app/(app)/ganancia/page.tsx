
'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Percent, Landmark, Crown, Handshake, Building, User, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { redirect } from 'next/navigation';

function LocationProfitCard({ title, netProfit }: { title: string, netProfit: number }) {
  const localProfit = netProfit * 0.5;
  const distributionProfit = netProfit * 0.5;
  
  const headBarberProfit = localProfit * 0.05;
  const barbershopNetProfit = localProfit * 0.95;

  const franchiseeProfit = distributionProfit * 0.6;
  const partnersPool = distributionProfit * 0.4;
  
  const partnersProfit = partnersPool * 0.6;
  const plantProfit = partnersPool * 0.4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Ganancia Neta del Período: {formatCurrency(netProfit)}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna Izquierda: Ganancia Local */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">1. Ganancia Local (50%)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">{formatCurrency(localProfit)}</p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="flex items-center gap-2"><Crown className="text-yellow-500" /> 5% Jefe de Barberos</span>
                  <span className="font-semibold">{formatCurrency(headBarberProfit)}</span>
                </div>
                 <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="flex items-center gap-2"><Landmark className="text-green-500" /> 95% Ganancia Neta Barbería</span>
                  <span className="font-semibold">{formatCurrency(barbershopNetProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Columna Derecha: Ganancia a Distribuir */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">2. Ganancia a Distribuir (50%)</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-xl font-bold text-accent">{formatCurrency(distributionProfit)}</p>
               <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="flex items-center gap-2"><Building /> 60% Franquiciado</span>
                    <span className="font-semibold">{formatCurrency(franchiseeProfit)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                     <span className="flex items-center gap-2"><Handshake /> 40% Socios</span>
                     <span className="font-semibold">{formatCurrency(partnersPool)}</span>
                  </div>
               </div>
            </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detalle Socios (del 40%)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md mb-2">
                  <span className="flex items-center gap-2">60% Ganancia Socios</span>
                  <span className="font-semibold">{formatCurrency(partnersProfit)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="flex items-center gap-2">40% Ganancia Planta</span>
                  <span className="font-semibold">{formatCurrency(plantProfit)}</span>
                </div>
              </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function PlantProfitCard({ plantProfit }: { plantProfit: number }) {
  const partners = [
    { name: 'Engel', share: 33.3 },
    { name: 'Roy', share: 33.3 },
    { name: 'Katherine', share: 33.3 },
  ]
  const localProfit = plantProfit * 0.5;
  const distributionProfit = plantProfit * 0.5;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Percent /> Distribución de Ganancia (PLANTA)</CardTitle>
        <CardDescription>Basado en una ganancia neta de {formatCurrency(plantProfit)}.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">1. Ganancia Local (50%)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(localProfit)}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">2. Ganancia a Distribuir Socios (50%)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">{formatCurrency(distributionProfit)}</p>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold">Desglose por Socio:</h3>
                {partners.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><User />{p.name} ({p.share}%)</span>
                    <span className="font-semibold">{formatCurrency(distributionProfit * (p.share / 100))}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}


export default function GananciaPage() {
  const { location } = useAuth();
  const state = useAppState();

  if (location !== 'PSYFN' && location !== 'MAGALLANES' && location !== 'SARRIAS') {
    // Or a loading spinner
    return null;
  }
  
  if (location === 'PSYFN') {
    // Redirect or render PSYFN specific component
    const { transactions, expenses } = useAppState();
    const totalIncome = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses;

     return (
        <div className="space-y-6">
            <PageHeader title="Ganancias de Planta" description="Distribución de ganancias para la planta y socios." />
            <PlantProfitCard plantProfit={netProfit} />
        </div>
    );
  }

  // Regular location view
  const { transactions, products, expenses } = state;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const filteredTransactions = transactions.filter(tx => {
    if (!startDate && !endDate) return true;
    const txDate = tx.endTime;
    const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && txDate < start) return false;
    if (end && txDate > end) return false;
    return true;
  });

  // Monthly or Annual calculations for profit distribution
  const isAnnual = selectedMonth === -1;
  const periodStart = isAnnual ? new Date(selectedYear, 0, 1) : new Date(selectedYear, selectedMonth, 1);
  const periodEnd = isAnnual ? new Date(selectedYear, 11, 31, 23, 59, 59, 999) : new Date(new Date(selectedYear, selectedMonth + 1, 0).setHours(23, 59, 59, 999));
  
  const periodTransactions = transactions.filter(tx => {
    const txDate = tx.endTime;
    return txDate >= periodStart && txDate <= periodEnd;
  });
  
  const periodExpenses = expenses.filter(exp => {
    const expDate = exp.timestamp;
    return expDate >= periodStart && expDate <= periodEnd;
  });

  const periodTotalIncome = periodTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const periodTotalExpensesValue = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = periodTotalIncome - periodTotalExpensesValue;
  
  const earningsByItem = filteredTransactions
    .flatMap(tx => tx.items)
    .reduce((acc, item) => {
      const productDetails = products.find(p => p.id === item.id);
      const cost = item.type === 'product' && productDetails ? productDetails.cost : 0;
      
      if (!acc[item.id]) {
        acc[item.id] = { name: item.name, quantity: 0, revenue: 0, cost: 0 };
      }
      
      acc[item.id].quantity += item.quantity;
      acc[item.id].revenue += item.price * item.quantity;
      acc[item.id].cost += cost * item.quantity;

      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number; cost: number }>);
  
  const earningsByItemList = Object.values(earningsByItem).sort((a, b) => b.revenue - a.revenue);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const periodLabel = isAnnual ? selectedYear : `${monthNames[selectedMonth]} ${selectedYear}`;


  return (
    <div className="space-y-6">
      <PageHeader title="GANANCIAS TOTALES" description="Detalle de rentabilidad por cada producto y servicio vendido." />
      
       <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl"><Percent /> Distribución de Ganancia Neta</CardTitle>
              <CardDescription>Basado en una ganancia neta de {formatCurrency(netProfit)} para {periodLabel}.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mes" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">Anual</SelectItem>
                        {monthNames.map((month, index) => (
                            <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
                    <SelectContent>
                        {years.map(year => (
                           <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <LocationProfitCard title={`Distribución para ${location}`} netProfit={netProfit}/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganancia Neta por Ítem (Período Seleccionado)</CardTitle>
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
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead className="text-center">Cant. Vendida</TableHead>
                <TableHead className="text-right">Ingresos Totales</TableHead>
                <TableHead className="text-right">Costo Total</TableHead>
                <TableHead className="text-right">Ganancia Neta</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {earningsByItemList.length > 0 ? (
                earningsByItemList.map(item => (
                    <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                    <TableCell className="text-right font-bold text-green-400">{formatCurrency(item.revenue - item.cost)}</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No hay ventas de items en el período seleccionado.</TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
