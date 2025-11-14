'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Staff, Service, Product, TicketItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { formatCurrency }from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export function StartServiceContent({ nextBarberId }: { nextBarberId: string | null }) {
  const { customers, staff, services, products, startService, addOrEdit } = useAppState();
  const { toast } = useToast();
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [createNewCustomerMode, setCreateNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerDob, setNewCustomerDob] = useState('');

  const [selectedBarber, setSelectedBarber] = useState(nextBarberId || '');
  const [selectedItems, setSelectedItems] = useState<TicketItem[]>([]);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    setSelectedBarber(nextBarberId || '');
  }, [nextBarberId]);

  const allBarbers = staff.filter(s => s.role === 'barber');
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddItem = () => {
    if (!selectedItemToAdd) {
      toast({ title: 'Error', description: 'Por favor, seleccione un servicio o producto.', variant: 'destructive' });
      return;
    }
    const [type, id] = selectedItemToAdd.split('-');
    const itemSource = type === 'service' ? services : products;
    const itemToAdd = itemSource.find(i => i.id === id);

    if (itemToAdd) {
      setSelectedItems(prev => [...prev, { ...itemToAdd, type: type as 'service' | 'product', quantity: itemQuantity }]);
      setSelectedItemToAdd('');
      setItemQuantity(1);
    }
  };
  
  const handleRemoveItem = (indexToRemove: number) => {
    setSelectedItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleStartServiceWrapper = async () => {
    let finalCustomerId = selectedCustomer;
    if (createNewCustomerMode) {
      if (!newCustomerName) {
        toast({ title: 'Error', description: 'El nombre del nuevo cliente es requerido.', variant: 'destructive' });
        return;
      }
      await addOrEdit('customers', { name: newCustomerName, dob: newCustomerDob });
      // This is a simplified approach. A real app would need to get the new ID.
      // For this mock, we assume the latest customer is the one just added.
      const newCustomer = customers.find(c => c.name === newCustomerName);
      if (newCustomer) {
          finalCustomerId = newCustomer.id;
      } else {
          toast({ title: 'Error', description: 'No se pudo crear el cliente.', variant: 'destructive' });
          return;
      }
    }
    if (!selectedBarber || !finalCustomerId || selectedItems.length === 0) {
      toast({ title: 'Error', description: 'Barbero, cliente y al menos un item son requeridos.', variant: 'destructive' });
      return;
    }
    startService(finalCustomerId, selectedBarber, selectedItems, totalAmount);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Seleccionar Barbero</Label>
        <Select value={selectedBarber} onValueChange={setSelectedBarber}>
          <SelectTrigger><SelectValue placeholder="-- Seleccione un barbero --" /></SelectTrigger>
          <SelectContent>
            {allBarbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Seleccionar Cliente</Label>
        <Select value={selectedCustomer} onValueChange={(val) => {setSelectedCustomer(val); setCreateNewCustomerMode(false)}}>
          <SelectTrigger><SelectValue placeholder="-- Seleccione un cliente --" /></SelectTrigger>
          <SelectContent>
            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="link" className="p-0 h-auto mt-2" onClick={() => {setCreateNewCustomerMode(true); setSelectedCustomer('')}}>
          + Crear Nuevo Cliente
        </Button>
      </div>

      {createNewCustomerMode && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h3 className="font-semibold text-primary">Detalles Nuevo Cliente</h3>
          <Input placeholder="Nombre del cliente" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
          <Input type="date" value={newCustomerDob} onChange={e => setNewCustomerDob(e.target.value)} />
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
        <h3 className="font-semibold text-primary">Añadir Servicios/Productos</h3>
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Label>Item</Label>
            <Select value={selectedItemToAdd} onValueChange={setSelectedItemToAdd}>
              <SelectTrigger><SelectValue placeholder="-- Seleccione un item --" /></SelectTrigger>
              <SelectContent>
                <SelectGroup><Label>Servicios</Label>{services.map(s => <SelectItem key={`s-${s.id}`} value={`service-${s.id}`}>{s.name} ({formatCurrency(s.price)})</SelectItem>)}</SelectGroup>
                <SelectGroup><Label>Productos</Label>{products.map(p => <SelectItem key={`p-${p.id}`} value={`product-${p.id}`}>{p.name} ({formatCurrency(p.price)})</SelectItem>)}</SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddItem} disabled={!selectedItemToAdd}><Plus /></Button>
        </div>
        
        <ScrollArea className="h-32">
        <ul className="space-y-1 pr-4">
          {selectedItems.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex justify-between items-center bg-background p-2 rounded">
              <span>{item.name} <span className="text-muted-foreground">({formatCurrency(item.price)})</span></span>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(index)}><X size={16} /></Button>
            </li>
          ))}
        </ul>
        </ScrollArea>

        <p className="text-xl font-bold text-right text-primary">Total: {formatCurrency(totalAmount)}</p>
      </div>

      <Button onClick={handleStartServiceWrapper} className="w-full">Iniciar Servicio</Button>
    </div>
  );
}
