'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Home,
  Scissors,
  Package,
  Users,
  BarChart,
  Settings,
  ShoppingCart,
  ListOrdered,
  Key,
  Wallet,
  LogOut,
  BrainCircuit,
  UserCheck,
} from 'lucide-react';
import { Button } from './ui/button';

const adminViews = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/turn-queue', label: 'Cola de Turnos', icon: ListOrdered },
  { href: '/pos', label: 'Punto de Venta', icon: UserCheck },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/staff', label: 'Personal', icon: Users },
  { href: '/customers', label: 'Clientes', icon: Scissors },
  { href: '/expenses', label: 'Gastos', icon: Wallet },
  { href: '/reports', label: 'Reportes', icon: BarChart },
  { href: '/forecast', label: 'Previsión IA', icon: BrainCircuit },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

const receptionistViews = [
  { href: '/turn-queue', label: 'Cola de Turnos', icon: ListOrdered },
  { href: '/pos', label: 'Punto de Venta', icon: UserCheck },
  { href: '/cash-register', label: 'Control de Caja', icon: Key },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/staff', label: 'Personal', icon: Users },
  { href: '/customers', label: 'Clientes', icon: Scissors },
  { href: '/expenses', label: 'Gastos', icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const views = role === 'admin' ? adminViews : receptionistViews;

  return (
    <aside className="w-64 bg-card text-card-foreground p-4 flex flex-col shadow-lg border-r">
      <div className="text-2xl font-bold text-primary mb-8 text-center">
        NORDICO POS
      </div>
      <nav className="flex-grow">
        <ul>
          {views.map(({ href, label, icon: Icon }) => (
            <li key={href} className="mb-2">
              <Link href={href} passHref>
                <Button
                  variant={pathname === href ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted-foreground/20'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-border/50">
        <div className="text-sm text-muted-foreground mb-2">
          Rol: <span className="font-semibold text-primary">{role.toUpperCase()}</span>
        </div>
        <Button onClick={logout} variant="destructive" className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
