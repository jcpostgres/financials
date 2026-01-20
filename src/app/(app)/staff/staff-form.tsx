'use client';

import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface StaffFormProps {
  isEditing: boolean;
  onSave: (data: Partial<Staff>) => void;
  initialData: Partial<Staff> | null;
}

export function StaffForm({ isEditing, onSave, initialData }: StaffFormProps) {
  const [formData, setFormData] = useState(initialData || { role: '' });

  useEffect(() => {
    setFormData(initialData || { name: '', role: '' });
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
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre:</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol:</Label>
        <Input 
          id="role"
          name="role"
          value={formData.role || ''}
          onChange={handleChange}
          placeholder="Ej: Barbero, Vendedor, Repartidor..."
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="monthlyPayment">Pago Mensual ($):</Label>
        <Input id="monthlyPayment" name="monthlyPayment" type="number" value={formData.monthlyPayment || ''} onChange={handleChange} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="rentAmount">Alquiler Semanal ($):</Label>
            <Input id="rentAmount" name="rentAmount" type="number" value={formData.rentAmount || ''} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="commissionPercentage">Comisión (%)</Label>
          <Input id="commissionPercentage" name="commissionPercentage" type="number" value={formData.commissionPercentage || ''} onChange={handleChange} />
        </div>
      </div>
      
      <Button type="submit" className="w-full">{isEditing ? 'Actualizar Personal' : 'Agregar Personal'}</Button>
    </form>
  );
}
