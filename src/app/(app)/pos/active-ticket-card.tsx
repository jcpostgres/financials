'use client';

import type { ActiveTicket } from '@/lib/types';
import { useAppState } from '@/hooks/use-app-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState }from 'react';
import { useToast } from '@/hooks/use-toast';

interface ActiveTicketCardProps {
  ticket: ActiveTicket;
}

function FinalizePaymentContent({ ticket }: { ticket: ActiveTicket }) {
    const { finalizePayment } = useAppState();
    const [paymentMethod, setPaymentMethod] = useState('');

    return (
        <div className="space-y-4">
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
            <Button onClick={() => finalizePayment(ticket, paymentMethod)} className="w-full" disabled={!paymentMethod}>
                Confirmar y Registrar Venta
            </Button>
        </div>
    );
}

function AddItemContent({ ticket }: { ticket: ActiveTicket }) {
    const { services, products, addItemToTicket } = useAppState();
    const { toast } = useToast();
    const [selectedItem, setSelectedItem] = useState('');

    const handleAddItem = () => {
        if (!selectedItem) {
            toast({ title: 'Error', description: 'Por favor, seleccione un item.', variant: 'destructive' });
            return;
        }
        const [type, id] = selectedItem.split('-');
        const itemSource = type === 'service' ? services : products;
        const item = itemSource.find(i => i.id === id);
        if (item) {
            addItemToTicket(ticket.id, item, type as 'service' | 'product');
        }
    };
    
    return (
         <div className="space-y-4">
            <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger><SelectValue placeholder="-- Seleccione un item --" /></SelectTrigger>
                <SelectContent>
                    <SelectGroup><div className="px-2 py-1.5 text-sm font-semibold">Servicios</div>{services.map(s => <SelectItem key={`s-${s.id}`} value={`service-${s.id}`}>{s.name} ({formatCurrency(s.price)})</SelectItem>)}</SelectGroup>
                    <SelectGroup><div className="px-2 py-1.5 text-sm font-semibold">Productos</div>{products.map(p => <SelectItem key={`p-${p.id}`} value={`product-${p.id}`}>{p.name} ({formatCurrency(p.price)})</SelectItem>)}</SelectGroup>
                </SelectContent>
            </Select>
            <Button onClick={handleAddItem} className="w-full" disabled={!selectedItem}>Añadir Item</Button>
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
