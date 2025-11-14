'use client';

import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, UserCheck, UserPlus, UserMinus, ChevronsUpDown } from 'lucide-react';
import { AddBarberToQueueContent, StartServiceContent } from './queue-modals';
import { useToast } from '@/hooks/use-toast';

export default function TurnQueuePage() {
  const { staff, barberTurnQueue, openModal, removeBarberFromQueue, moveBarberInQueue } = useAppState();
  const { toast } = useToast();

  const nextBarberId = barberTurnQueue.length > 0 ? barberTurnQueue[0] : null;
  const allBarbers = staff.filter(s => s.role === 'barber');

  const openStartServiceModal = () => {
    if (allBarbers.length === 0) {
      toast({ title: 'Atención', description: 'No hay barberos registrados. Vaya a "Personal" para añadirlos.', variant: 'destructive' });
      return;
    }
    openModal(
      <StartServiceContent nextBarberId={nextBarberId} />,
      'Iniciar Nuevo Servicio'
    );
  };

  const openAddBarberToQueueModal = () => {
    openModal(<AddBarberToQueueContent />, 'Añadir Barbero a Cola');
  };

  return (
    <div>
      <PageHeader title="Cola de Turnos" description="Gestiona el orden de atención de los barberos.">
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAddBarberToQueueModal}><UserPlus className="mr-2 h-4 w-4" /> Añadir Barbero</Button>
          <Button onClick={openStartServiceModal}><UserCheck className="mr-2 h-4 w-4" /> Iniciar Servicio</Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListOrdered /> Cola de Turnos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {allBarbers.length === 0 ? (
            <p className="text-destructive text-center py-4">¡Atención! No hay barberos registrados.</p>
          ) : barberTurnQueue.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay barberos en la cola. Añada uno para iniciar.</p>
          ) : (
            <ol className="space-y-3">
              {barberTurnQueue.map((barberId, index) => {
                const barber = staff.find(s => s.id === barberId);
                return (
                  <li
                    key={barberId}
                    className={`p-3 rounded-lg flex justify-between items-center transition-colors ${
                      index === 0
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted'
                    }`}
                  >
                    <span className="text-lg">{index + 1}. {barber?.name || 'Barbero Desconocido'}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveBarberInQueue(barberId, 'up')} disabled={index === 0}>
                        <ChevronsUpDown className="h-4 w-4 transform -rotate-180" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => moveBarberInQueue(barberId, 'down')} disabled={index === barberTurnQueue.length-1}>
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeBarberFromQueue(barberId)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
