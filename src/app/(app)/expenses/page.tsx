'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Expense } from '@/lib/types';
import { ExpenseForm } from './expense-form';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ExpensesPage() {
  const { expenses, staff, openModal, addOrEdit, handleDelete: deleteExpense } = useAppState();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openExpenseModal = (expense: Expense | null = null) => {
    openModal(
      <ExpenseForm
        isEditing={!!expense}
        onSave={(data) => addOrEdit('expenses', data, expense?.id)}
        initialData={expense}
      />,
      expense ? 'Editar Gasto' : 'Registrar Gasto'
    );
  };

  const openEmployeeCreditModal = () => {
    openModal(
      <ExpenseForm
        isEmployeeCredit={true}
        staffList={staff}
        isEditing={false}
        onSave={(data) => addOrEdit('expenses', data)}
        initialData={{ description: 'Crédito a empleado', amount: 0, category: 'Crédito a Empleado' }}
      />,
      'Registrar Crédito a Empleado'
    );
  };
  
  const confirmDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  const onConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense('expenses', expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

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

  const filteredExpenses = expenses.filter(exp => {
    if (!startDate && !endDate) return true;
    const expDate = exp.timestamp;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && expDate < start) return false;
    if (end && expDate > end) return false;
    return true;
  }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

  const employeeCredits = filteredExpenses.filter(e => e.category === 'Crédito a Empleado');
  const otherExpenses = filteredExpenses.filter(e => e.category !== 'Crédito a Empleado');

  return (
    <>
      <PageHeader title="Registro de Gastos" description="Añade y gestiona todos los gastos y créditos del negocio.">
        <Button onClick={openEmployeeCreditModal} variant="outline">
          <Wallet className="mr-2 h-4 w-4" /> Registrar Crédito
        </Button>
        <Button onClick={() => openExpenseModal()}>
          <Plus className="mr-2 h-4 w-4" /> Registrar Gasto
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

      <div className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Gastos Generales</CardTitle></CardHeader>
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
                {otherExpenses.length > 0 ? otherExpenses.map(e => (
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
                )) : <TableRow><TableCell colSpan={5} className="text-center">No hay gastos generales para el período seleccionado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Créditos a Empleados</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeCredits.length > 0 ? employeeCredits.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.timestamp.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{staff.find(s => s.id === e.staffId)?.name || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center">No hay créditos a empleados para el período seleccionado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el gasto "${expenseToDelete?.description}"?`}
      />
    </>
  );
}
