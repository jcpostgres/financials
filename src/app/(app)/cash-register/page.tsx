
'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Key, ArrowDownFromLine, Percent, Landmark, Crown, Handshake, Building } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Transaction } from '@/lib/types';


function PaymentMethodTransactionsDialog({ method, amount, transactions, bcvRate }: { method: string, amount: number, transactions: Transaction[], bcvRate: number }) {
  const methodTransactions = transactions.filter(tx => tx.paymentMethod === method);
  const showBs = ['Tarjeta', 'Pago Móvil', 'Efectivo BS', 'Transferencia'].includes(method);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-auto py-3">
          <span className="font-semibold">{method}</span>
          <div className="text-right">
            <span className="text-primary font-bold block">{formatCurrency(amount)}</span>
            {showBs && <span className="text-xs text-muted-foreground">Bs. {(amount * bcvRate).toFixed(2)}</span>}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Transacciones para: {method}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Monto (USD)</TableHead>
                {showBs && <TableHead>Monto (Bs.)</TableHead>}
                {method === 'Pago Móvil' && <TableHead>Referencia</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {methodTransactions.length > 0 ? methodTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.endTime.toLocaleString()}</TableCell>
                  <TableCell>{tx.items.map(i => i.name).join(', ')}</TableCell>
                  <TableCell>{formatCurrency(tx.totalAmount)} / <span className="text-xs text-muted-foreground">Bs. {(tx.totalAmount * bcvRate).toFixed(2)}</span></TableCell>
                  {showBs && <TableCell>Bs. {(tx.totalAmount * bcvRate).toFixed(2)}</TableCell>}
                  {method === 'Pago Móvil' && <TableCell>{tx.referenceNumber}</TableCell>}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={showBs ? (method === 'Pago Móvil' ? 5 : 4) : 3} className="text-center">
                    No hay transacciones para este método.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function CashRegisterPage() {
  const { transactions, expenses, customers, appSettings } = useAppState();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCashClose = () => {
    toast({ title: 'Cierre de Caja Realizado', description: 'El resumen del día ha sido registrado (simulado).' });
  };
  
  const handleWithdrawal = () => {
    toast({ title: 'Función no implementada', description: 'La lógica para retiros de caja aún no se ha definido.' });
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

  const filteredTransactions = transactions.filter(tx => {
    if (!startDate && !endDate) return true;
    const txDate = tx.endTime;
    const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && txDate < start) return false;
    if (end && txDate > end) return false;
    return true;
  }).sort((a,b) => b.endTime.getTime() - a.endTime.getTime());

  const filteredExpenses = expenses.filter(exp => {
    if (!startDate && !endDate) return true;
    const expDate = exp.timestamp;
    const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
    if (start && expDate < start) return false;
    if (end && expDate > end) return false;
    return true;
  }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

  const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const incomeByPaymentMethod = filteredTransactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <PageHeader
        title="Control de Caja y Distribución"
        description="Filtre para ver un resumen financiero y la distribución de ganancias."
      >
        <Button onClick={handleWithdrawal} variant="outline">
          <ArrowDownFromLine className="mr-2 h-4 w-4" /> Retiros de Caja
        </Button>
        <Button onClick={handleCashClose}>
          <Key className="mr-2 h-4 w-4" /> Cierre de Caja
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ingresos por Método de Pago</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(incomeByPaymentMethod).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(incomeByPaymentMethod).map(([method, amount]) => (
                  <PaymentMethodTransactionsDialog
                    key={method}
                    method={method}
                    amount={amount}
                    transactions={filteredTransactions}
                    bcvRate={appSettings.bcvRate}
                  />
                ))}
              </div>
            ) : <p className="text-muted-foreground text-center">No hay ingresos para el período.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gastos del Período</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {filteredExpenses.length > 0 ? filteredExpenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <div>{exp.description}</div>
                      <div className="text-xs text-muted-foreground">{exp.category}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell className="text-center">No hay gastos para el período.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Transacciones del Período</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.endTime.toLocaleString()}</TableCell>
                  <TableCell>{customers.find(c => c.id === tx.customerId)?.name || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(tx.totalAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{tx.paymentMethod}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center">No hay transacciones para el período.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
