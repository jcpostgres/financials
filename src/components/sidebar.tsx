
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
  ClipboardList,
  DollarSign,
  TrendingUp,
  ArrowDownFromLine,
  Landmark,
  BadgeDollarSign,
  Building
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const adminViews = [
  { href: '/dashboard', label: 'INICIO', group: 'General', icon: Home },
  { href: '/turn-queue', label: 'Cola de Turno', icon: ListOrdered, group: 'Recepción' },
  { href: '/pos', label: 'Cobro de Ventas', icon: UserCheck, group: 'Recepción' },
  { href: '/settings', label: 'Tasa de Cambio BCV', icon: DollarSign, group: 'Recepción' },
  { href: '/staff', label: 'Personal', icon: Users, group: 'Gestión' },
  { href: '/customers', label: 'Clientes', icon: Scissors, group: 'Gestión' },
  { href: '/inventory', label: 'Inventario', icon: Package, group: 'Gestión' },
  { href: '/expenses', label: 'Gastos', icon: Wallet, group: 'Finanzas' },
  { href: '/reports', label: 'Ingresos', icon: TrendingUp, group: 'Finanzas' },
  { href: '/cash-register', label: 'Control de Caja', icon: Key, group: 'Finanzas' },
  { href: '/ganancia', label: 'Ganancia', icon: BadgeDollarSign, group: 'Finanzas' },
  { href: '/reports/daily-closes', label: 'Cierres Diarios', icon: ClipboardList, group: 'Finanzas' },
];

const receptionistViews = [
  { href: '/turn-queue', label: 'Cola de Turno', icon: ListOrdered, group: 'Recepción' },
  { href: '/pos', label: 'Cobro de Ventas', icon: UserCheck, 'group': 'Recepción' },
  { href: '/settings', label: 'Tasa de Cambio BCV', icon: DollarSign, 'group': 'Recepción' },
  { href: '/customers', label: 'Clientes', icon: Scissors, group: 'Gestión' },
  { href: '/inventory', label: 'Inventario', icon: Package, group: 'Gestión' },
  { href: '/expenses', label: 'Gastos', icon: Wallet, group: 'Finanzas' },
  { href: '/cash-register', label: 'Control de Caja', icon: Key, group: 'Finanzas' },
];

const psyfnViews = [
    { href: '/dashboard', label: 'INICIO', group: 'General', icon: Home },
    { href: '/expenses', label: 'GASTOS', group: 'Planta', icon: Wallet},
    { href: '/reports', label: 'INGRESOS', group: 'Planta', icon: TrendingUp},
    { href: '/ganancia', label: 'GANANCIAS', group: 'Planta', icon: BadgeDollarSign},
    { href: '/reports/daily-closes', label: 'CIERRES DIARIOS', group: 'Planta', icon: ClipboardList},
    { href: '/staff', label: 'Personal', icon: Users, group: 'Gestión' },
    { href: '/customers', label: 'Clientes', icon: Scissors, group: 'Gestión' },
    { href: '/inventory', label: 'Inventario', icon: Package, group: 'Gestión' },
    { href: '/sedes', label: 'MAGALLANES', group: 'Sedes', icon: Building },
    { href: '/sedes', query: { sede: 'SARRIAS' }, label: 'SARRIAS', group: 'Sedes', icon: Building },
    { href: '/sedes', query: { sede: 'TOTAL' }, label: 'TOTAL GENERAL', group: 'Sedes', icon: Landmark },
];


const PsyfnSidebar = () => {
  const pathname = usePathname();
  const { logout, location } = useAuth();
  
  const groupedViews = psyfnViews.reduce((acc, view) => {
    const group = view.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(view);
    return acc;
  }, {} as Record<string, typeof psyfnViews>);

  const groupOrder = ['General', 'Planta', 'Gestión', 'Sedes'];

  return (
      <aside className="w-64 bg-card text-card-foreground p-4 flex flex-col shadow-lg border-r">
          <div className="text-2xl font-bold text-primary mb-2 text-center">NORDICO POS</div>
          <div className="text-center text-sm text-muted-foreground mb-6">
              Sede: <span className="font-semibold text-primary">{location}</span>
          </div>
          <nav className="flex-grow space-y-4">
              {groupedViews['General']?.map(({ href, label, icon: Icon }) => (
                   <Link href={href} passHref key={label}>
                        <Button
                            variant={pathname === href ? 'default' : 'secondary'}
                            className='w-full justify-start text-base h-12'
                        >
                            <Icon className="mr-3 h-6 w-6" />
                            {label}
                        </Button>
                    </Link>
              ))}

              <Accordion type="multiple" defaultValue={['Planta', 'Gestión', 'Sedes']} className="w-full">
                  {groupOrder.filter(g => g !== 'General').map(groupName => (
                      groupedViews[groupName] && (
                           <AccordionItem value={groupName} key={groupName}>
                              <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                                  <div className="flex items-center">
                                      <ClipboardList className="mr-2 h-4 w-4" />
                                      {groupName}
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                   <ul className="space-y-1 pt-2">
                                      {groupedViews[groupName].map(({ href, label, icon: Icon, query }) => (
                                          <li key={label}>
                                              <Link href={{pathname: href, query}} passHref>
                                                  <Button
                                                      variant={pathname === href ? 'default' : 'ghost'}
                                                      className={cn('w-full justify-start', pathname === href && 'bg-primary text-primary-foreground')}
                                                  >
                                                      <Icon className="mr-3 h-5 w-5" />
                                                      {label}
                                                  </Button>
                                              </Link>
                                          </li>
                                      ))}
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                      )
                  ))}
              </Accordion>
          </nav>
          <div className="mt-auto pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-2">
                  Rol: <span className="font-semibold text-primary">ADMINISTRADOR</span>
              </div>
              <Button onClick={logout} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </Button>
          </div>
      </aside>
  );
};


export function Sidebar() {
  const pathname = usePathname();
  const { role, logout, location } = useAuth();
  
  if (location === 'PSYFN') {
    return <PsyfnSidebar />;
  }

  const views = role === 'admin' ? adminViews : receptionistViews;

  const dashboardView = role === 'admin' ? views.find(v => v.href === '/dashboard') : null;
  const otherViews = views.filter(v => v.href !== '/dashboard');

  const groupedViews = otherViews.reduce((acc, view) => {
    const group = view.group || 'General';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(view);
    return acc;
  }, {} as Record<string, typeof views>);

  // Define the order of the groups
  const groupOrder = ['Recepción', 'Gestión', 'Finanzas', 'General'];


  return (
    <aside className="w-64 bg-card text-card-foreground p-4 flex flex-col shadow-lg border-r">
      <div className="text-2xl font-bold text-primary mb-2 text-center">
        NORDICO POS
      </div>
      <div className="text-center text-sm text-muted-foreground mb-6">
        Sede: <span className="font-semibold text-primary">{location}</span>
      </div>
      <nav className="flex-grow space-y-4">
        {dashboardView && (
            <Link href={dashboardView.href} passHref>
                <Button
                variant={pathname === dashboardView.href ? 'default' : 'secondary'}
                className='w-full justify-start text-base h-12'
                >
                <dashboardView.icon className="mr-3 h-6 w-6" />
                {dashboardView.label}
                </Button>
            </Link>
        )}
        {groupOrder.map(groupName => {
          const groupViews = groupedViews[groupName];
          if (!groupViews) return null;

          const renderedGroupName = groupName === 'Finanzas' && location === 'PSYFN' ? 'PLANTA' : groupName;
          
          return (
            <div key={groupName}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                {renderedGroupName}
              </h3>
              <ul className="space-y-1">
                {groupViews.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
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
            </div>
          )
        })}
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
