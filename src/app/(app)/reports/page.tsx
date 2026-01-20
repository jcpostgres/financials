
'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { IncomeForm } from './income-form';


export default function ReportsPage() {
  const { transactions, openModal, addOrEdit } = useAppState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openIncomeModal = () => {
    openModal(
      <IncomeForm
        onSave={(data) => addOrEdit('transactions', data)}
      />,
      'Registrar Ingreso Manual'
    );
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

  const incomeByCategories = filteredTransactions
    .flatMap(tx => tx.items)
    .reduce((acc, item) => {
      let category: string | null = null;
      if (item.category === 'barberia' || item.category === 'nordico') {
        category = 'Servicio de Barberia';
      } else if (item.category === 'zona gamer') {
        category = 'Zona Gamer';
      } else if (item.category === 'Snack') {
        category = 'Snacks';
      } else if (item.type === 'product' && item.category !== 'Cortesía' && item.category !== 'Snack de Cortesía') {
        category = 'Productos';
      }

      if (category) {
        acc[category] = (acc[category] || 0) + (item.price * item.quantity);
      }
      
      return acc;
    }, {} as Record<string, number>);
    
  const totalCategoryIncome = Object.values(incomeByCategories).reduce((sum, amount) => sum + amount, 0);


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
    <>
      <PageHeader title="Reportes Detallados" description="Analiza el rendimiento de tus categorías.">
         <Button onClick={() => openIncomeModal()}>
          <Plus className="mr-2 h-4 w-4" /> Registrar Ingreso
        </Button>
      </PageHeader>

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

      <div className="space-y-6 animate-fade-in-up">
        <Card>
          <CardHeader><CardTitle>Ingresos por Categoría</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Object.keys(incomeByCategories)).length > 0 ? (
                  (Object.keys(incomeByCategories)).sort().map(category => (
                    <TableRow key={category}>
                      <TableCell className="font-semibold">{category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(incomeByCategories[category])}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={2} className="text-center">No hay ingresos por categoría para el período seleccionado.</TableCell></TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableHead className="font-bold">Total</TableHead>
                  <TableHead className="text-right font-bold">{formatCurrency(totalCategoryIncome)}</TableHead>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
