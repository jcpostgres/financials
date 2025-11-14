'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AddBarberToQueueContent() {
  const { staff, barberTurnQueue, addBarberToQueue } = useAppState();
  const [selectedBarberToAdd, setSelectedBarberToAdd] = useState('');

  const allBarbers = staff.filter(s => s.role === 'barber');
  const availableBarbersForQueue = allBarbers.filter(s => !barberTurnQueue.includes(s.id));

  return (
    <div>
      <div className="mb-4 space-y-2">
        <Label>Seleccionar Barbero para la cola:</Label>
        {allBarbers.length === 0 ? (
          <p className="text-sm text-destructive italic">No hay barberos registrados. Vaya a "Personal" para añadirlos.</p>
        ) : availableBarbersForQueue.length > 0 ? (
          <Select value={selectedBarberToAdd} onValueChange={setSelectedBarberToAdd}>
            <SelectTrigger><SelectValue placeholder="-- Seleccione un barbero --" /></SelectTrigger>
            <SelectContent>
              {availableBarbersForQueue.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground italic">Todos los barberos registrados ya están en la cola.</p>
        )}
      </div>
      {availableBarbersForQueue.length > 0 && (
        <Button onClick={() => addBarberToQueue(selectedBarberToAdd)} className="w-full" disabled={!selectedBarberToAdd}>
          Añadir a la Cola
        </Button>
      )}
    </div>
  );
}
