'use client';

import { useState, useEffect } from 'react';
import type { Expense } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ExpenseFormProps {
  isEditing: boolean;
  onSave: (data: Partial<Expense>) => void;
  initialData: Partial<Expense> | null;
}

export function ExpenseForm({ isEditing, onSave, initialData }: ExpenseFormProps) {
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
        <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Ej: Salarios, Suministros" required/>
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? 'Actualizar Gasto' : 'Registrar Gasto'}
      </Button>
    </form>
  );
}
