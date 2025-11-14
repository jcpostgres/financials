'use client';

import { useState, useEffect } from 'react';
import type { Expense, Staff } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseFormProps {
  isEditing: boolean;
  onSave: (data: Partial<Expense>) => void;
  initialData: Partial<Expense> | null;
  isEmployeeCredit?: boolean;
  staffList?: Staff[];
}

export function ExpenseForm({ isEditing, onSave, initialData, isEmployeeCredit = false, staffList = [] }: ExpenseFormProps) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || { description: '', amount: 0, category: '' });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, staffId: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      category: isEmployeeCredit ? 'Crédito a Empleado' : formData.category
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEmployeeCredit && (
        <div className="space-y-2">
          <Label htmlFor="staffId">Empleado:</Label>
          <Select name="staffId" value={formData.staffId || ''} onValueChange={handleSelectChange} required>
            <SelectTrigger><SelectValue placeholder="-- Seleccione un empleado --"/></SelectTrigger>
            <SelectContent>
              {staffList?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción:</Label>
        <Input id="description" name="description" value={formData.description || ''} onChange={handleChange} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Monto ($):</Label>
        <Input id="amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required/>
      </div>
      {!isEmployeeCredit && (
        <div className="space-y-2">
          <Label htmlFor="category">Categoría:</Label>
          <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Ej: Salarios, Suministros" required/>
        </div>
      )}
      <Button type="submit" className="w-full">
        {isEditing ? 'Actualizar Gasto' : (isEmployeeCredit ? 'Registrar Crédito' : 'Registrar Gasto')}
      </Button>
    </form>
  );
}
