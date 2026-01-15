
'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export default function GananciaPage() {
  const { transactions, products } = useAppState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  return (
    <div>
      <PageHeader title="Análisis de Ganancias por Ítem" description="Detalle de rentabilidad por cada producto y servicio vendido." />
      
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

      <Card>
        <CardHeader><CardTitle>Ganancia Neta por Ítem</CardTitle></CardHeader>
        <CardContent className="p-0">
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
