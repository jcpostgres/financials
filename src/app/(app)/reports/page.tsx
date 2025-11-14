'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { transactions, expenses } = useAppState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    if (!startDate && !endDate) return true;
    const txDate = tx.endTime;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && txDate < start) return false;
    if (end && txDate > end) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(exp => {
    if (!startDate && !endDate) return true;
    const expDate = exp.timestamp;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && expDate < start) return false;
    if (end && expDate > end) return false;
    return true;
  });

  const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const incomeByPaymentMethod = filteredTransactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.totalAmount;
    return acc;
  }, {} as Record<string, number>);

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

  return (
    <div>
      <PageHeader title="Reportes Financieros" description="Analiza el rendimiento financiero de tu negocio." />
      
      <Card className="mb-6">
        <CardHeader><CardTitle>Filtro por Fecha</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><Label>Fecha Inicio:</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div><Label>Fecha Fin:</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setFilterPreset('today')}>Hoy</Button>
            <Button variant="outline" onClick={() => setFilterPreset('month')}>Este Mes</Button>
            <Button variant="outline" onClick={() => setFilterPreset('year')}>Este Año</Button>
            <Button variant="destructive" onClick={() => { setStartDate(''); setEndDate(''); }}>Limpiar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader><CardTitle>Ingresos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Gastos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Ganancia Neta</CardTitle></CardHeader><CardContent className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ingresos por Método de Pago</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(incomeByPaymentMethod).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(incomeByPaymentMethod).map(([method, amount]) => (
                  <li key={method} className="flex justify-between items-center bg-muted p-3 rounded-md">
                    <span className="font-semibold">{method}</span><span>{formatCurrency(amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground text-center">No hay datos para el período.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ganancias de Socios</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-center">Cálculo de ganancias de socios (en desarrollo).</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
