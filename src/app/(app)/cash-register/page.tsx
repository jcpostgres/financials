
'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Key, ArrowDownFromLine, Percent, Landmark, Crown, Handshake, Building, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Transaction, Withdrawal } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/common/confirm-dialog';


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

function WithdrawalForm({ onSave }: { onSave: (data: any) => void }) {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'BS'>('USD');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ amount: Number(amount), currency, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="space-y-2">
                <Label htmlFor="amount">Monto:</Label>
                <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Moneda:</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as 'USD' | 'BS')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">Dólares ($)</SelectItem>
                        <SelectItem value="BS">Bolívares (Bs.)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional):</Label>
                <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Registrar Retiro</Button>
        </form>
    );
}

export default function CashRegisterPage() {
  const { transactions, expenses, customers, appSettings, withdrawals, openModal, addOrEdit, handleDelete } = useAppState();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Withdrawal | null>(null);

  const handleCashClose = () => {
    toast({ title: 'Cierre de Caja Realizado', description: 'El resumen del día ha sido registrado (simulado).' });
  };
  
  const handleWithdrawal = () => {
    openModal(
        <WithdrawalForm onSave={(data) => addOrEdit('withdrawals', data)} />,
        'Registrar Retiro de Caja'
    );
  };
  
  const confirmDelete = (withdrawal: Withdrawal) => {
    setWithdrawalToDelete(withdrawal);
  };

  const onConfirmDelete = () => {
    if (withdrawalToDelete) {
      handleDelete('withdrawals', withdrawalToDelete.id);
      setWithdrawalToDelete(null);
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

  const filterByDate = (items: (Transaction | Expense | Withdrawal)[], dateKey: 'endTime' | 'timestamp') => {
     return items.filter(item => {
        if (!startDate && !endDate) return true;
        const itemDate = item[dateKey] as Date;
        const start = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null;
        const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;
        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
    });
  }

  const filteredTransactions = filterByDate(transactions, 'endTime') as Transaction[];
  const filteredExpenses = filterByDate(expenses, 'timestamp') as Expense[];
  const filteredWithdrawals = filterByDate(withdrawals, 'timestamp') as Withdrawal[];

  const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  const totalCashUSD = filteredTransactions.filter(tx => tx.paymentMethod === 'Efectivo USD').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalCashBSInUSD = filteredTransactions.filter(tx => tx.paymentMethod === 'Efectivo BS').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalCashBS = totalCashBSInUSD * appSettings.bcvRate;

  const totalWithdrawalsUSD = filteredWithdrawals.filter(w => w.currency === 'USD').reduce((sum, w) => sum + w.amount, 0);
  const totalWithdrawalsBS = filteredWithdrawals.filter(w => w.currency === 'BS').reduce((sum, w) => sum + w.amount, 0);
  
  const cashBalanceUSD = totalCashUSD - totalWithdrawalsUSD;
  const cashBalanceBS = totalCashBS - totalWithdrawalsBS;

  const allPaymentMethods = ['Efectivo BS', 'Efectivo USD', 'Tarjeta', 'Transferencia', 'Pago Móvil'];

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

       <Card className="mb-6">
        <CardHeader><CardTitle>Estado de Caja</CardTitle></CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Efectivo en Caja (USD)</p>
                    <p className={`text-2xl font-bold ${cashBalanceUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(cashBalanceUSD)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Efectivo en Caja (Bs.)</p>
                    <p className={`text-2xl font-bold ${cashBalanceBS >= 0 ? 'text-green-400' : 'text-red-400'}`}>Bs. {cashBalanceBS.toFixed(2)}</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ingresos por Método de Pago</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {allPaymentMethods.map(method => (
                <PaymentMethodTransactionsDialog
                  key={method}
                  method={method}
                  amount={incomeByPaymentMethod[method] || 0}
                  transactions={filteredTransactions}
                  bcvRate={appSettings.bcvRate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Historial de Retiros</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
              <TableBody>
                {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell>{w.timestamp.toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{w.currency === 'USD' ? formatCurrency(w.amount) : `Bs. ${w.amount.toFixed(2)}`}</TableCell>
                    <TableCell>{w.notes}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(w)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center">No hay retiros para el período.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
       <Card className="mt-6">
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
       <ConfirmDialog
        isOpen={!!withdrawalToDelete}
        onClose={() => setWithdrawalToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar este retiro? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
