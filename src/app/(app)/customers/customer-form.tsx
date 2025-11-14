'use client';

import { useState, useEffect } from 'react';
import type { Customer } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CustomerFormProps {
  isEditing: boolean;
  onSave: (data: Partial<Customer>) => void;
  initialData: Partial<Customer> | null;
}

export function CustomerForm({ isEditing, onSave, initialData }: CustomerFormProps) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || { name: '', dob: '' });
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
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob">Fecha de Nacimiento:</Label>
        <Input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob || ''}
          onChange={handleChange}
        />
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? 'Actualizar Cliente' : 'Agregar Cliente'}
      </Button>
    </form>
  );
}
