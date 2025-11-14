'use client';

import { useAppState } from '@/hooks/use-app-state';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function CashRegisterPage() {
  const { transactions, expenses, staff, customers } = useAppState();
  const { toast } = useToast();

  const today = new Date();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const dailyTransactions = transactions.filter(tx => tx.endTime >= startOfDay && tx.endTime <= endOfDay);
  const dailyExpenses = expenses.filter(exp => exp.timestamp >= startOfDay && exp.timestamp <= endOfDay);

  const totalDailyIncome = dailyTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dailyCashBalance = totalDailyIncome - totalDailyExpenses;

  const incomeByPaymentMethod = dailyTransactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const handleCashClose = () => {
    toast({ title: 'Cierre de Caja Realizado', description: 'El resumen del día ha sido registrado (simulado).' });
  };

  return (
    <div>
      <PageHeader
        title="Control de Caja Diario"
        description={`Resumen de movimientos para el ${today.toLocaleDateString()}`}
      >
        <Button onClick={handleCashClose}>
          <Key className="mr-2 h-4 w-4" /> Realizar Cierre de Caja
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Ingresos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-400">{formatCurrency(totalDailyIncome)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gastos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-400">{formatCurrency(totalDailyExpenses)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${dailyCashBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(dailyCashBalance)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ingresos por Método de Pago</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(incomeByPaymentMethod).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(incomeByPaymentMethod).map(([method, amount]) => (
                  <li key={method} className="flex justify-between items-center bg-muted p-2 rounded-md">
                    <span className="font-semibold">{method}</span>
                    <span>{formatCurrency(amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground text-center">No hay ingresos hoy.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gastos del Día</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {dailyExpenses.length > 0 ? dailyExpenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <div>{exp.description}</div>
                      <div className="text-xs text-muted-foreground">{exp.category}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell className="text-center">No hay gastos hoy.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Transacciones del Día</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyTransactions.length > 0 ? dailyTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.endTime.toLocaleTimeString()}</TableCell>
                  <TableCell>{customers.find(c => c.id === tx.customerId)?.name || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(tx.totalAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{tx.paymentMethod}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center">No hay transacciones hoy.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
