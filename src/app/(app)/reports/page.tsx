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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Transaction } from '@/lib/types';
import { BarberReports } from './barber-reports';

type IncomeCategory = 'Servicios' | 'Productos' | 'Snacks' | 'Zona Gamer';

export default function ReportsPage() {
  const { transactions, expenses, products, staff } = useAppState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'income' | 'barbers' | 'categories'>('income');

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

  const transactionsByPaymentMethod = filteredTransactions.reduce((acc, tx) => {
    const method = tx.paymentMethod;
    if (!acc[method]) {
      acc[method] = {
        total: 0,
        transactions: []
      };
    }
    acc[method].total += tx.totalAmount;
    acc[method].transactions.push(tx);
    return acc;
  }, {} as Record<string, { total: number; transactions: Transaction[] }>);

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

  const incomeByCategories = filteredTransactions
    .flatMap(tx => tx.items)
    .reduce((acc, item) => {
      let category: IncomeCategory | null = null;
      if (item.category === 'barberia' || item.category === 'nordico') {
        category = 'Servicios';
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
    }, {} as Record<IncomeCategory, number>);
    
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
    <div>
      <PageHeader title="Reporte de Ingresos" description="Analiza el rendimiento financiero de tu negocio." />

      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === 'income' ? 'default' : 'outline'} onClick={() => setActiveTab('income')}>Ingresos</Button>
        <Button variant={activeTab === 'barbers' ? 'default' : 'outline'} onClick={() => setActiveTab('barbers')}>Barberos</Button>
        <Button variant={activeTab === 'categories' ? 'default' : 'outline'} onClick={() => setActiveTab('categories')}>Categorías</Button>
      </div>
      
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

      {activeTab === 'income' && (
        <div className="animate-fade-in-up space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle>Ingresos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Gastos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Ganancia Neta</CardTitle></CardHeader><CardContent className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Ingresos por Método de Pago</CardTitle></CardHeader>
            <CardContent>
              {Object.keys(transactionsByPaymentMethod).length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(transactionsByPaymentMethod).map(([method, data]) => (
                    <AccordionItem value={method} key={method}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span className="font-semibold">{method}</span>
                          <span>{formatCurrency(data.total)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Monto</TableHead>
                              {method === 'Pago Móvil' && <TableHead>Referencia</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.transactions.map(tx => (
                              <TableRow key={tx.id}>
                                <TableCell>{tx.endTime.toLocaleString()}</TableCell>
                                <TableCell>{tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                                <TableCell>{formatCurrency(tx.totalAmount)}</TableCell>
                                {method === 'Pago Móvil' && <TableCell>{tx.referenceNumber}</TableCell>}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : <p className="text-muted-foreground text-center">No hay datos para el período.</p>}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Ganancias por Item</CardTitle></CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Cant. Vendida</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
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

          <Card>
            <CardHeader><CardTitle>Ganancias de Socios</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-center">Cálculo de ganancias de socios (en desarrollo).</p></CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'barbers' && (
        <div className="animate-fade-in-up">
           <BarberReports transactions={filteredTransactions} staff={staff} />
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="animate-fade-in-up">
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
                  {(Object.keys(incomeByCategories) as IncomeCategory[]).length > 0 ? (
                    (Object.keys(incomeByCategories) as IncomeCategory[]).sort().map(category => (
                      <TableRow key={category}>
                        <TableCell className="font-semibold">{category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(incomeByCategories[category])}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={2} className="text-center">No hay ingresos por categoría.</TableCell></TableRow>
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
      )}
    </div>
  );
}
