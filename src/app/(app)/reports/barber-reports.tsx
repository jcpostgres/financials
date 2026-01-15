'use client';

import { useMemo, useState } from 'react';
import type { Staff, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BarberReportsProps {
  transactions: Transaction[];
  staff: Staff[];
}

function BarberDetailsDialog({ barber }: { barber: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 w-full">Ver Detalles</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle de Transacciones - {barber.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Ingreso Total</p>
              <p className="font-bold text-lg">{formatCurrency(barber.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ingreso (Servicios)</p>
              <p className="font-bold text-lg">{formatCurrency(barber.totalServiceRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ingreso (Productos)</p>
              <p className="font-bold text-lg">{formatCurrency(barber.totalProductRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comisión ({barber.commissionPercentage}%)</p>
              <p className="font-bold text-lg text-green-400">{formatCurrency(barber.commissionEarned)}</p>
            </div>
          </div>
          <h4 className="font-semibold mb-2 px-4">Transacciones:</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barber.transactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.endTime.toLocaleDateString()}</TableCell>
                  <TableCell>{tx.customerName || 'N/A'}</TableCell>
                  <TableCell>{tx.items.map((i: any) => i.name).join(', ')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barberData.map((barber) => (
              <Card key={barber.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{barber.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingreso Total:</span>
                    <span className="font-bold text-primary">{formatCurrency(barber.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comisión Ganada:</span>
                    <span className="font-bold text-green-400">{formatCurrency(barber.commissionEarned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicios:</span>
                    <span className="font-bold">{barber.transactionCount}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <BarberDetailsDialog barber={barber} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay datos de barberos para el período seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
