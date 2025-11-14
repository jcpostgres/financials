'use client';

import { useState, useEffect } from 'react';
import type { Service, Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormProps<T> {
  isEditing: boolean;
  onSave: (data: Partial<T>) => void;
  initialData: Partial<T> | null;
}

export function ServiceForm({ isEditing, onSave, initialData }: FormProps<Service>) {
  const [formData, setFormData] = useState(initialData || { category: 'barberia' });

  useEffect(() => {
    setFormData(initialData || { name: '', price: 0, description: '', category: 'barberia' });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, category: value as 'barberia' | 'nordico' | 'zona gamer'}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre:</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Precio ($):</Label>
        <Input id="price" name="price" type="number" value={formData.price || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Categoría:</Label>
        <Select name="category" value={formData.category || 'barberia'} onValueChange={handleSelectChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="barberia">Barbería</SelectItem>
            <SelectItem value="nordico">Nordico</SelectItem>
            <SelectItem value="zona gamer">Zona Gamer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción:</Label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} />
      </div>
      <Button type="submit" className="w-full">{isEditing ? 'Actualizar Servicio' : 'Agregar Servicio'}</Button>
    </form>
  );
}

export function ProductForm({ isEditing, onSave, initialData }: FormProps<Product>) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || { name: '', price: 0, cost: 0, stock: 0, category: '' });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre:</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required/>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio Venta ($):</Label>
          <Input id="price" name="price" type="number" value={formData.price || ''} onChange={handleChange} required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Costo ($):</Label>
          <Input id="cost" name="cost" type="number" value={formData.cost || ''} onChange={handleChange} required/>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="stock">Stock:</Label>
        <Input id="stock" name="stock" type="number" value={formData.stock || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Categoría:</Label>
        <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Ej: Bebida, Cuidado Capilar" required/>
      </div>
      <Button type="submit" className="w-full">{isEditing ? 'Actualizar Producto' : 'Agregar Producto'}</Button>
    </form>
  );
}

    