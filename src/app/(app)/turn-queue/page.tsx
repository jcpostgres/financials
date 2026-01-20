'use client';

import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, UserPlus, Trash2, ChevronsUpDown, CheckSquare, Plus } from 'lucide-react';
import { AddBarberToQueueContent, NewServiceForm } from './queue-modals';
import { useToast } from '@/hooks/use-toast';

export default function TurnQueuePage() {
  const { staff, barberTurnQueue, openModal, rotateBarberInQueue, moveBarberInQueue, clearBarberQueue, removeBarberFromQueue } = useAppState();
  const { toast } = useToast();

  const allBarbers = staff.filter(s => s.role.toLowerCase().includes('barber'));

  const openAddBarberToQueueModal = () => {
    if (allBarbers.length === 0) {
      toast({ title: 'Atención', description: 'No hay personal con rol de "Barbero". Vaya a "Personal" para añadirlos.', variant: 'destructive' });
      return;
    }
    openModal(<AddBarberToQueueContent />, 'Añadir Barbero a Cola');
  };
  
  const openNewServiceModal = () => {
    if (barberTurnQueue.length === 0) {
      toast({ title: 'Atención', description: 'No hay barberos en la cola de turnos.', variant: 'destructive'});
      return;
    }
    openModal(<NewServiceForm />, 'Iniciar Nuevo Servicio');
  };

  return (
    <div>
      <PageHeader title="Cola de Turnos" description="Gestiona el orden de atención de los barberos.">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => clearBarberQueue()}><Trash2 className="mr-2 h-4 w-4" /> Limpiar Cola</Button>
          <Button onClick={openAddBarberToQueueModal}><UserPlus className="mr-2 h-4 w-4" /> Añadir Barbero</Button>
        </div>
      </PageHeader>
      
      <div className="mb-6">
        <Button onClick={openNewServiceModal} size="lg" className="w-full">
            <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListOrdered /> Cola de Turnos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {allBarbers.length === 0 ? (
            <p className="text-destructive text-center py-4">¡Atención! No hay personal con rol de "Barbero" registrado.</p>
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
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeBarberFromQueue(barberId)}
                        className={index === 0 ? 'text-primary-foreground hover:bg-primary/80' : 'text-destructive'}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => rotateBarberInQueue(barberId)}
                        className={index === 0 ? 'text-primary-foreground hover:bg-primary/80' : ''}
                      >
                        <CheckSquare className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveBarberInQueue(barberId, 'up')} disabled={index === 0} className={index === 0 ? 'text-primary-foreground hover:bg-primary/80' : ''}>
                        <ChevronsUpDown className="h-4 w-4 transform -rotate-90" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => moveBarberInQueue(barberId, 'down')} disabled={index === barberTurnQueue.length-1} className={index === 0 ? 'text-primary-foreground hover:bg-primary/80' : ''}>
                        <ChevronsUpDown className="h-4 w-4 transform rotate-90" />
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
