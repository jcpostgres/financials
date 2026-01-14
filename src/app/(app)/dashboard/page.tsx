'use client';

import { useAppState } from '@/hooks/use-app-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/common/page-header';
import { TrendingUp, Clock, Users, Calendar, BarChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { transactions, activeTickets, barberTurnQueue, expenses } = useAppState();

  const today = new Date();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  
  const salesToday = transactions
    .filter(tx => tx.endTime && new Date(tx.endTime) >= startOfDay)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const activeServicesCount = activeTickets.length;
  const activeBarbersCount = barberTurnQueue.length;

  const currentYear = today.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const yearlyIncome = transactions
    .filter(tx => tx.endTime >= startOfYear && tx.endTime <= endOfYear)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const yearlyExpenses = expenses
    .filter(exp => exp.timestamp >= startOfYear && exp.timestamp <= endOfYear)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const yearlyProfit = yearlyIncome - yearlyExpenses;

  return (
    <div>
      <PageHeader
        title="PANEL GENERAL"
        description="Vista general del rendimiento de la barbería."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Barberos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{activeBarbersCount}</div>
            <p className="text-xs text-muted-foreground">Barberos actualmente en la cola de turnos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias del Año</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${yearlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(yearlyProfit)}</div>
            <p className="text-xs text-muted-foreground">Ganancia neta en {currentYear}.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
