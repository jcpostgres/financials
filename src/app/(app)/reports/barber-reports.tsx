'use client';

import { useMemo } from 'react';
import type { Staff, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface BarberReportsProps {
  transactions: Transaction[];
  staff: Staff[];
}

export function BarberReports({ transactions, staff }: BarberReportsProps) {
  const barberData = useMemo(() => {
    const barbers = staff.filter(s => s.role === 'barber');

    return barbers.map(barber => {
      const barberTransactions = transactions.filter(tx => tx.barberId === barber.id);
      
      const serviceItems = barberTransactions.flatMap(tx => tx.items.filter(i => i.type === 'service'));
      const productItems = barberTransactions.flatMap(tx => tx.items.filter(i => i.type === 'product'));
      
      const totalServiceRevenue = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalProductRevenue = productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalRevenue = totalServiceRevenue + totalProductRevenue;

      const commissionPercentage = barber.commissionPercentage || 0;
      const commissionEarned = totalServiceRevenue * (commissionPercentage / 100);

      return {
        ...barber,
        totalRevenue,
        totalServiceRevenue,
        totalProductRevenue,
        commissionEarned,
        transactionCount: barberTransactions.length,
        transactions: barberTransactions,
      };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);
  }, [transactions, staff]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de Ingresos por Barbero</CardTitle>
      </CardHeader>
      <CardContent>
        {barberData.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {barberData.map((barber) => (
              <AccordionItem value={barber.id} key={barber.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4 items-center">
                    <span className="font-semibold text-lg">{barber.name}</span>
                    <div className="text-right">
                        <div className="font-bold text-primary">{formatCurrency(barber.totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground">{barber.transactionCount} servicios</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-muted/50 rounded-md">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Ingreso Total</p>
                            <p className="font-bold">{formatCurrency(barber.totalRevenue)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ingreso (Servicios)</p>
                            <p className="font-bold">{formatCurrency(barber.totalServiceRevenue)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ingreso (Productos)</p>
                            <p className="font-bold">{formatCurrency(barber.totalProductRevenue)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Comisión Ganada ({barber.commissionPercentage}%)</p>
                            <p className="font-bold text-green-400">{formatCurrency(barber.commissionEarned)}</p>
                        </div>
                    </div>
                    <h4 className="font-semibold mb-2">Transacciones:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {barber.transactions.map(tx => (
                          <TableRow key={tx.id}>
                            <TableCell>{tx.endTime.toLocaleDateString()}</TableCell>
                            <TableCell>{tx.items.map(i => i.name).join(', ')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(tx.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay datos de barberos para el período seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
