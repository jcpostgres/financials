'use client';

import { useState, useEffect } from 'react';
import type { OtherIncome } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface IncomeFormProps {
  isEditing: boolean;
  onSave: (data: Partial<OtherIncome>) => void;
  initialData: Partial<OtherIncome> | null;
}

export function IncomeForm({ isEditing, onSave, initialData }: IncomeFormProps) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || { description: '', amount: 0, category: '' });
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
        <Label htmlFor="description">Descripción:</Label>
        <Input id="description" name="description" value={formData.description || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Monto ($):</Label>
        <Input id="amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
          <Label htmlFor="category">Categoría:</Label>
          <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Ej: Venta de Activo, Intereses" required/>
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? 'Actualizar Ingreso' : 'Registrar Ingreso'}
      </Button>
    </form>
  );
}
