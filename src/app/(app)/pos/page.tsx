'use client';

import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Clock } from 'lucide-react';
import { ActiveTicketCard } from './active-ticket-card';

export default function PosPage() {
  const { activeTickets } = useAppState();

  return (
    <div>
      <PageHeader
        title="Punto de Venta"
        description="Gestiona los servicios que se están realizando actualmente."
      />
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Clock /> Servicios Activos</h2>
        {activeTickets.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay servicios activos en este momento.</p>
            <p className="text-sm text-muted-foreground">Inicia un nuevo servicio desde la Cola de Turnos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTickets.map(ticket => (
              <ActiveTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
