'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Scissors, Package, Sandwich, Gamepad2, Gift } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { TicketItem } from '@/lib/types';
import { CustomerForm } from '../customers/customer-form';
import { useToast } from '@/hooks/use-toast';

export function AddBarberToQueueContent() {
  const { staff, barberTurnQueue, addBarberToQueue } = useAppState();
  const [selectedBarberToAdd, setSelectedBarberToAdd] = useState('');

  const allBarbers = staff.filter(s => s.role === 'barber' || s.role === 'head_barber');
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

export function NewServiceForm() {
    const { staff, customers, services, products, barberTurnQueue, startService, openModal, addOrEdit } = useAppState();
    const { toast } = useToast();
    
    const [barberId, setBarberId] = useState(barberTurnQueue[0] || '');
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<TicketItem[]>([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<'service' | 'product' | 'snack' | 'gamer' | null>(null);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const barbersInQueue = staff.filter(s => barberTurnQueue.includes(s.id));

    const getItemsForCategory = () => {
        if (selectedCategory === 'service') return services.filter(s => s.category === 'barberia' || s.category === 'nordico');
        if (selectedCategory === 'product') return products.filter(p => p.category !== 'Snack' && p.category !== 'Cortesía' && p.category !== 'Snack de Cortesía');
        if (selectedCategory === 'snack') return products.filter(p => p.category === 'Snack');
        if (selectedCategory === 'gamer') return services.filter(s => s.category === 'zona gamer');
        return [];
    };

    const getItemTypeAndSource = (item: { category?: string }): { type: 'service' | 'product', source: (typeof services | typeof products) } => {
        if (item.category === 'barberia' || item.category === 'nordico' || item.category === 'zona gamer') {
            return { type: 'service', source: services };
        }
        return { type: 'product', source: products };
    };

    const handleAddItem = () => {
        if (!selectedItem || !selectedCategory) return;
        
        const [itemId] = selectedItem.split('_');
        const categoryItems = getItemsForCategory();
        const itemToAdd = categoryItems.find(i => i.id === itemId);

        if (itemToAdd) {
            const { type } = getItemTypeAndSource(itemToAdd);

            setItems(prev => {
                const existing = prev.find(i => i.id === itemToAdd.id && i.type === type);
                if (existing) {
                    return prev.map(i => i.id === itemToAdd.id && i.type === type ? { ...i, quantity: i.quantity + quantity } : i);
                } else {
                    return [...prev, { id: itemToAdd.id, name: itemToAdd.name, price: Number(itemToAdd.price), quantity, type, category: itemToAdd.category }];
                }
            });
        }
        setSelectedItem('');
        setQuantity(1);
    };

    const handleAddCourtesySnack = (courtesyType: 'Bebida' | 'Snack') => {
        const category = courtesyType === 'Bebida' ? 'Cortesía' : 'Snack de Cortesía';
        const courtesyItem = products.find(p => p.category === category && p.price === 0);
        if (!courtesyItem) {
            toast({ title: "Error", description: `No se encontró un item de ${category} configurado.`, variant: "destructive" });
            return;
        }

        setItems(prev => {
            const existing = prev.find(i => i.id === courtesyItem.id);
            if (existing) {
                toast({ title: "Información", description: "El item de cortesía ya fue añadido." });
                return prev;
            }
            toast({ title: "Éxito", description: `${courtesyItem.name} añadido.` });
            return [...prev, {
                id: courtesyItem.id,
                name: courtesyItem.name,
                price: 0,
                quantity: 1,
                type: 'product',
                category: category
            }];
        });
    };
    
    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartService = () => {
        startService(customerId, barberId, items, totalAmount);
    };

    const openCreateCustomerModal = () => {
        openModal(
            <CustomerForm
                isEditing={false}
                onSave={(data) => addOrEdit('customers', data)}
                initialData={{ name: '', dob: '', phone: '' }}
            />,
            'Crear Nuevo Cliente'
        );
    };

    const categoryButtons = [
        { name: 'Servicio', value: 'service', icon: Scissors },
        { name: 'Producto', value: 'product', icon: Package },
        { name: 'Snack', value: 'snack', icon: Sandwich },
        { name: 'Gamer', value: 'gamer', icon: Gamepad2 }
    ] as const;

    const itemsForCategory = getItemsForCategory();

    return (
        <div className="space-y-4">
            {/* Barber and Customer Selection */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="barber">Seleccionar Barbero:</Label>
                    <Select value={barberId} onValueChange={setBarberId}>
                        <SelectTrigger id="barber"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {barbersInQueue.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="customer">Seleccionar Cliente:</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger id="customer"><SelectValue placeholder="-- Seleccione un cliente --" /></SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={openCreateCustomerModal}>+ Crear Nuevo Cliente</Button>
                </div>
            </div>

            <Separator />
            
            {/* Add Items */}
            <div className="space-y-3">
                <Label>Añadir Items</Label>
                <div className="grid grid-cols-2 gap-2">
                    {categoryButtons.map(cat => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'default' : 'outline'}
                            onClick={() => {setSelectedCategory(cat.value); setSelectedItem('');}}
                        >
                            <cat.icon className="mr-2 h-4 w-4" />
                            {cat.name}
                        </Button>
                    ))}
                </div>
                 <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => handleAddCourtesySnack('Bebida')} className="flex-1">
                        <Gift className="mr-2 h-4 w-4 text-accent" /> Cortesía (Bebida)
                    </Button>
                     <Button variant="outline" onClick={() => handleAddCourtesySnack('Snack')} className="flex-1">
                        <Gift className="mr-2 h-4 w-4 text-accent" /> Cortesía (Snack)
                    </Button>
                </div>

                {selectedCategory && (
                    <div className="flex items-center gap-2 animate-fade-in-up">
                        <Select value={selectedItem} onValueChange={setSelectedItem}>
                            <SelectTrigger><SelectValue placeholder="-- Seleccione un item --" /></SelectTrigger>
                            <SelectContent>
                                {itemsForCategory.length > 0 ? itemsForCategory.map((item, index) => (
                                    <SelectItem
                                        key={`${item.id}_${index}`}
                                        value={`${item.id}_${index}`}
                                    >
                                        {item.name} ({formatCurrency(item.price)})
                                    </SelectItem>
                                )) : <div className="p-2 text-center text-sm text-muted-foreground">No hay items.</div>}
                            </SelectContent>
                        </Select>
                        <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="w-20" aria-label="Cantidad" />
                        <Button size="icon" onClick={handleAddItem} disabled={!selectedItem}><Plus className="h-4 w-4" /></Button>
                    </div>
                )}
            </div>

            {/* Ticket Items */}
            <div>
                <h3 className="text-sm font-medium mb-2">Items en el Ticket:</h3>
                <div className="space-y-2">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                <div>
                                    {item.name} <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(index)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">No hay items añadidos.</p>
                    )}
                </div>
            </div>

            <Separator />
            
            {/* Total and Action */}
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
            </div>
            
            <Button className="w-full" onClick={handleStartService} disabled={!barberId || !customerId || items.length === 0}>
                Iniciar Servicio
            </Button>
        </div>
    );
}
