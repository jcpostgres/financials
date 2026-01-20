'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import type { Product, TicketItem, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CustomerForm } from '@/app/(app)/customers/customer-form';

interface ManualTransactionFormProps {
  onSave: (data: Partial<Transaction>) => void;
  isEditing: boolean;
  initialData: Partial<Transaction> | null;
}

export function IncomeForm({ onSave, isEditing, initialData }: ManualTransactionFormProps) {
    const { customers, products, openModal, addOrEdit } = useAppState();
    const { toast } = useToast();
    
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<TicketItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [reference, setReference] = useState('');

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (initialData) {
            setCustomerId(initialData.customerId || '');
            setItems(initialData.items || []);
            setPaymentMethod(initialData.paymentMethod || '');
            setReference(initialData.referenceNumber || '');
        } else {
            setCustomerId('');
            setItems([]);
            setPaymentMethod('');
            setReference('');
        }
    }, [initialData]);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const [productId] = selectedProduct.split('_');
        const productToAdd = products.find(p => p.id === productId);

        if (productToAdd) {
            setItems(prev => {
                const existing = prev.find(i => i.id === productToAdd.id);
                if (existing) {
                    return prev.map(i => i.id === productToAdd.id ? { ...i, quantity: i.quantity + quantity } : i);
                } else {
                    return [...prev, { id: productToAdd.id, name: productToAdd.name, price: Number(productToAdd.price), quantity, type: 'product', category: productToAdd.category }];
                }
            });
        }
        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!customerId || items.length === 0 || !paymentMethod) {
            toast({
                title: 'Error de Validación',
                description: 'Debe seleccionar un cliente, añadir al menos un producto y seleccionar un método de pago.',
                variant: 'destructive',
            });
            return;
        }

        const transactionData: Partial<Transaction> = {
            customerId,
            items,
            totalAmount,
            paymentMethod,
            referenceNumber: reference,
            status: 'completed',
             ...( !isEditing && { 
              startTime: new Date(),
              endTime: new Date(),
              recordedBy: 'manual'
            })
        };

        onSave(transactionData);
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

    return (
        <div className="space-y-4 p-6">
            <div className="space-y-1">
                <Label htmlFor="customer">Cliente:</Label>
                 <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger id="customer"><SelectValue placeholder="-- Seleccione un cliente --" /></SelectTrigger>
                    <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Button variant="link" size="sm" className="p-0 h-auto" onClick={openCreateCustomerModal}>+ Crear Nuevo Cliente</Button>
            </div>

            <Separator />

            <div className="space-y-3">
                <Label>Productos</Label>
                <div className="flex items-center gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger><SelectValue placeholder="-- Seleccione un producto --" /></SelectTrigger>
                        <SelectContent>
                            {products.map((p, index) => (
                                <SelectItem key={`${p.id}_${index}`} value={`${p.id}_${index}`}>
                                    {p.name} ({formatCurrency(p.price)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="w-20" aria-label="Cantidad" />
                    <Button size="icon" onClick={handleAddItem} disabled={!selectedProduct}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium mb-2">Items a registrar:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                <div>{item.name} <span className="text-xs text-muted-foreground">x{item.quantity}</span></div>
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
            
            <div className="font-bold text-lg flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod"><SelectValue placeholder="-- Seleccione Método --" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Efectivo USD">Efectivo $</SelectItem>
                        <SelectItem value="Efectivo BS">Efectivo Bs</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                        <SelectItem value="Mixto">Mixto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            {(paymentMethod === 'Pago Móvil' || paymentMethod === 'Transferencia' || paymentMethod === 'Mixto') && (
                <div className="space-y-2">
                    <Label htmlFor="reference">Referencia / Observación</Label>
                    <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} />
                </div>
            )}

            <Button onClick={handleSubmit} className="w-full">
                {isEditing ? 'Actualizar Ingreso' : 'Registrar Ingreso'}
            </Button>
        </div>
    )
}
