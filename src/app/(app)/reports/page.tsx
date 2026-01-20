
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
import type { OtherIncome } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { IncomeForm } from './income-form';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Badge } from '@/components/ui/badge';


export default function ReportsPage() {
  const { transactions, otherIncomes, openModal, addOrEdit, handleDelete } = useAppState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [incomeToDelete, setIncomeToDelete] = useState<OtherIncome | null>(null);

  const openIncomeModal = (income: OtherIncome | null = null) => {
    openModal(
      <IncomeForm
        isEditing={!!income}
        onSave={(data) => addOrEdit('otherIncomes', data, income?.id)}
        initialData={income}
      />,
      income ? 'Editar Ingreso' : 'Registrar Ingreso'
    );
  };
  
  const confirmDelete = (income: OtherIncome) => {
    setIncomeToDelete(income);
  };

  const onConfirmDelete = () => {
    if (incomeToDelete) {
      handleDelete('otherIncomes', incomeToDelete.id);
      setIncomeToDelete(null);
    }
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

  const filteredOtherIncomes = (otherIncomes || []).filter(income => {
    if (!startDate && !endDate) return true;
    const incomeDate = income.timestamp;
    const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && incomeDate < start) return false;
    if (end && incomeDate > end) return false;
    return true;
  }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

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

    filteredOtherIncomes.forEach(income => {
      incomeByCategories[income.category] = (incomeByCategories[income.category] || 0) + income.amount;
  });
    
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

        <Card>
          <CardHeader><CardTitle>Otros Ingresos Registrados</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOtherIncomes.length > 0 ? filteredOtherIncomes.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.timestamp.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={5} className="text-center">No hay otros ingresos para el período seleccionado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={!!incomeToDelete}
        onClose={() => setIncomeToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el ingreso "${incomeToDelete?.description}"?`}
      />
    </>
  );
}
