'use client';

import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StaffFormProps {
  isEditing: boolean;
  onSave: (data: Partial<Staff>) => void;
  initialData: Partial<Staff> | null;
}

export function StaffForm({ isEditing, onSave, initialData }: StaffFormProps) {
  const [formData, setFormData] = useState(initialData || { role: 'barber' });

  useEffect(() => {
    setFormData(initialData || { name: '', role: 'barber' });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, role: value as 'barber' | 'recepcionista' | 'limpieza'}));
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
        <Label htmlFor="role">Rol:</Label>
        <Select name="role" value={formData.role || 'barber'} onValueChange={handleSelectChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="barber">Barbero</SelectItem>
            <SelectItem value="recepcionista">Recepcionista</SelectItem>
            <SelectItem value="limpieza">Limpieza</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.role === 'barber' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Alquiler Semanal ($):</Label>
              <Input id="rentAmount" name="rentAmount" type="number" value={formData.rentAmount || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionPercentage">Comisión (%):</Label>
              <Input id="commissionPercentage" name="commissionPercentage" type="number" value={formData.commissionPercentage || ''} onChange={handleChange} />
            </div>
          </div>
        </>
      )}
      <Button type="submit" className="w-full">{isEditing ? 'Actualizar Personal' : 'Agregar Personal'}</Button>
    </form>
  );
}
