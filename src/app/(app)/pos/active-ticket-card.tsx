'use client';

import type { ActiveTicket, Service, Product, TicketItem } from '@/lib/types';
import { useAppState } from '@/hooks/use-app-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState }from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Scissors, Sandwich, Gamepad2, Plus } from 'lucide-react';

interface ActiveTicketCardProps {
  ticket: ActiveTicket;
}

function FinalizePaymentContent({ ticket }: { ticket: ActiveTicket }) {
    const { finalizePayment } = useAppState();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const { toast } = useToast();

    const handleFinalize = () => {
        if (paymentMethod === 'Pago Móvil' && referenceNumber.length < 4) {
            toast({
                title: 'Error de Validación',
                description: 'El número de referencia debe tener al menos 4 dígitos.',
                variant: 'destructive',
            });
            return;
        }
        finalizePayment(ticket, paymentMethod, referenceNumber);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue placeholder="-- Seleccione Método de Pago --" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Efectivo BS">Efectivo BS</SelectItem>
                        <SelectItem value="Efectivo USD">Efectivo USD</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {paymentMethod === 'Pago Móvil' && (
                <div className="space-y-2 animate-fade-in-up">
                    <Label htmlFor="referenceNumber">Número de Referencia</Label>
                    <Input 
                        id="referenceNumber" 
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Mínimo 4 dígitos"
                        minLength={4}
                    />
                </div>
            )}

            <Button onClick={handleFinalize} className="w-full" disabled={!paymentMethod}>
                Confirmar y Registrar Venta
            </Button>
        </div>
    );
}

function AddItemContent({ ticket }: { ticket: ActiveTicket }) {
    const { services, products, addItemToTicket } = useAppState();
    const { toast } = useToast();
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<'service' | 'product' | 'snack' | 'gamer' | null>(null);

    const getItemsForCategory = () => {
        if (selectedCategory === 'service') return services.filter(s => s.category === 'barberia' || s.category === 'nordico');
        if (selectedCategory === 'product') return products.filter(p => p.category !== 'Snack');
        if (selectedCategory === 'snack') return products.filter(p => p.category === 'Snack');
        if (selectedCategory === 'gamer') return services.filter(s => s.category === 'zona gamer');
        return [];
    };
    
    const getItemTypeFromCategory = (category: string): 'service' | 'product' => {
        if (['barberia', 'nordico', 'zona gamer'].includes(category)) {
            return 'service';
        }
        return 'product';
    };

    const handleAddItem = () => {
        if (!selectedItem) {
            toast({ title: 'Error', description: 'Por favor, seleccione un item.', variant: 'destructive' });
            return;
        }
        const [itemId] = selectedItem.split('_');
        const categoryItems = getItemsForCategory();
        const item = categoryItems.find(i => i.id === itemId);

        if (item) {
            const itemType = getItemTypeFromCategory(item.category as string);
            addItemToTicket(ticket.id, item, itemType);
        }
        setSelectedItem('');
    };

    const categoryButtons = [
        { name: 'Servicio', value: 'service', icon: Scissors },
        { name: 'Producto', value: 'product', icon: Package },
        { name: 'Snack', value: 'snack', icon: Sandwich },
        { name: 'Zona Gamer', value: 'gamer', icon: Gamepad2 }
    ] as const;

    const itemsForCategory = getItemsForCategory();
    
    return (
         <div className="space-y-4">
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
                    <Button size="icon" onClick={handleAddItem} disabled={!selectedItem}><Plus className="h-4 w-4" /></Button>
                </div>
            )}
        </div>
    )
}

export function ActiveTicketCard({ ticket }: ActiveTicketCardProps) {
  const { customers, staff } = useAppState();
  const customer = customers.find(c => c.id === ticket.customerId);
  const barber = staff.find(s => s.id === ticket.barberId);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{customer?.name || 'Cliente Desconocido'}</CardTitle>
            <CardDescription>Por: {barber?.name || 'Barbero Desconocido'}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{formatCurrency(ticket.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Inició: {ticket.startTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-2" />
        <ul className="space-y-1 text-sm">
          {ticket.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
          {ticket.items.length === 0 && <li className="text-muted-foreground italic">Sin items</li>}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         <Dialog>
            <DialogTrigger asChild><Button variant="outline">Añadir Item</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Añadir Item al Ticket</DialogTitle></DialogHeader>
                <AddItemContent ticket={ticket} />
            </DialogContent>
        </Dialog>
        <Dialog>
            <DialogTrigger asChild><Button>Cobrar</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Finalizar y Cobrar</DialogTitle></DialogHeader>
                <div className="my-4">
                    <h3 className="font-semibold">Resumen</h3>
                    <p>Cliente: {customer?.name}</p>
                    <p>Barbero: {barber?.name}</p>
                    <p className="text-2xl font-bold mt-2">Total: {formatCurrency(ticket.totalAmount)}</p>
                </div>
                <FinalizePaymentContent ticket={ticket} />
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
