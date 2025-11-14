'use client';

import { useAppState } from '@/hooks/use-app-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/common/page-header';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { transactions, activeTickets, staff } = useAppState();

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  
  const salesToday = transactions
    .filter(tx => tx.endTime && tx.endTime >= startOfDay)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const activeServicesCount = activeTickets.length;
  const staffCount = staff.length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vista general del rendimiento de la barbería."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(salesToday)}</div>
            <p className="text-xs text-muted-foreground">Ingresos totales registrados hoy.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{activeServicesCount}</div>
            <p className="text-xs text-muted-foreground">Clientes siendo atendidos actualmente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Personal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Empleados y barberos registrados.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
