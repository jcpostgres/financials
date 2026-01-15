'use client';

import { useMemo } from 'react';
import type { Staff, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface BarberReportsProps {
  transactions: Transaction[];
  staff: Staff[];
}

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getCommissionPercentage = (serviceCount: number) => {
  if (serviceCount >= 41) return 65;
  if (serviceCount >= 30) return 60;
  return 55;
};

const getNextTier = (serviceCount: number) => {
  if (serviceCount >= 41) return { next: 41, servicesNeeded: 0 };
  if (serviceCount >= 30) return { next: 41, servicesNeeded: 41 - serviceCount };
  return { next: 30, servicesNeeded: 30 - serviceCount };
};

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
              <p className="text-sm text-muted-foreground">Ingreso Total (Semana)</p>
              <p className="font-bold text-lg">{formatCurrency(barber.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Servicios (Semana)</p>
              <p className="font-bold text-lg">{barber.weeklyServiceCount}</p>
            </div>
             <div>
              <p className="text-sm text-muted-foreground">Comisión Aplicada</p>
              <p className="font-bold text-lg">{barber.effectiveCommissionPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comisión Ganada</p>
              <p className="font-bold text-lg text-green-400">{formatCurrency(barber.commissionEarned)}</p>
            </div>
          </div>
          <h4 className="font-semibold mb-2 px-4">Transacciones del Período Filtrado:</h4>
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
    const barbers = staff.filter(s => s.role === 'barber' || s.role === 'head_barber');
    const startOfWeek = getStartOfWeek(new Date());
    startOfWeek.setHours(0, 0, 0, 0);

    return barbers.map(barber => {
      const barberTransactions = transactions.filter(tx => tx.barberId === barber.id);
      
      const weeklyTransactions = barberTransactions.filter(tx => new Date(tx.endTime) >= startOfWeek);

      const weeklyServiceItems = weeklyTransactions.flatMap(tx => tx.items.filter(i => i.type === 'service' && i.category === 'barberia'));
      const weeklyServiceCount = weeklyServiceItems.reduce((sum, item) => sum + item.quantity, 0);
      
      const weeklyServiceRevenue = weeklyServiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      let effectiveCommissionPercentage;
      let progress = 0;
      let servicesNeeded = 0;
      let nextTier = 0;

      if (barber.role === 'head_barber') {
        effectiveCommissionPercentage = barber.commissionPercentage || 65;
        progress = 100;
      } else {
        effectiveCommissionPercentage = getCommissionPercentage(weeklyServiceCount);
        const tierInfo = getNextTier(weeklyServiceCount);
        nextTier = tierInfo.next;
        servicesNeeded = tierInfo.servicesNeeded;
        if (nextTier > 0) {
            progress = (weeklyServiceCount / nextTier) * 100;
        }
      }

      const commissionEarned = weeklyServiceRevenue * (effectiveCommissionPercentage / 100);

      return {
        ...barber,
        totalRevenue: weeklyServiceRevenue,
        commissionEarned,
        transactionCount: barberTransactions.length,
        transactions: barberTransactions,
        weeklyServiceCount,
        effectiveCommissionPercentage,
        progress,
        servicesNeeded,
        nextTier,
      };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);
  }, [transactions, staff]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte Semanal de Comisiones por Barbero</CardTitle>
      </CardHeader>
      <CardContent>
        {barberData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barberData.map((barber) => (
              <Card key={barber.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base">{barber.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-xs">
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingreso (Servicios):</span>
                    <span className="font-semibold text-primary">{formatCurrency(barber.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comisión Ganada:</span>
                    <span className="font-semibold text-green-400">{formatCurrency(barber.commissionEarned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicios (Semana):</span>
                    <span className="font-semibold">{barber.weeklyServiceCount}</span>
                  </div>
                   <div className="space-y-1 pt-1">
                      <p className="text-xs text-muted-foreground">
                        {barber.role === 'head_barber' 
                          ? `Comisión Fija: ${barber.effectiveCommissionPercentage}%`
                          : `Progreso al ${barber.nextTier > 30 ? '65%' : '60%'}: ${barber.servicesNeeded} servicios restantes`
                        }
                      </p>
                      <Progress value={barber.role === 'head_barber' ? 100 : barber.progress} />
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
