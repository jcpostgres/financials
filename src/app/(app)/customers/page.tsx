'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Customer } from '@/lib/types';
import { CustomerForm } from './customer-form';
import { ConfirmDialog } from '@/components/common/confirm-dialog';

export default function CustomersPage() {
  const { customers, openModal, closeModal, addOrEdit, handleDelete: deleteCustomer } = useAppState();
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const openCustomerModal = (customer: Customer | null = null) => {
    openModal(
      <CustomerForm
        isEditing={!!customer}
        onSave={(data) => addOrEdit('customers', data, customer?.id)}
        initialData={customer}
      />,
      customer ? 'Editar Cliente' : 'Agregar Cliente'
    );
  };
  
  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const onConfirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer('customers', customerToDelete.id);
      setCustomerToDelete(null);
    }
  };


  return (
    <>
      <PageHeader title="Gestión de Clientes" description="Administra la información de tus clientes.">
        <Button onClick={() => openCustomerModal()}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Cliente
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>F. Nacimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone || 'N/A'}</TableCell>
                    <TableCell>{c.dob || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openCustomerModal(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(c)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No hay clientes registrados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el cliente "${customerToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
