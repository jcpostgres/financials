'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Staff } from '@/lib/types';
import { StaffForm } from './staff-form';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function StaffPage() {
  const { staff, openModal, addOrEdit, handleDelete: deleteStaff } = useAppState();
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const openStaffModal = (staffMember: Staff | null = null) => {
    openModal(
      <StaffForm
        isEditing={!!staffMember}
        onSave={(data) => addOrEdit('staff', data, staffMember?.id)}
        initialData={staffMember}
      />,
      staffMember ? 'Editar Personal' : 'Agregar Personal'
    );
  };
  
  const confirmDelete = (staffMember: Staff) => {
    setStaffToDelete(staffMember);
  };

  const onConfirmDelete = () => {
    if (staffToDelete) {
      deleteStaff('staff', staffToDelete.id);
      setStaffToDelete(null);
    }
  };


  return (
    <>
      <PageHeader title="Gestión de Personal" description="Administra a tus empleados y barberos.">
        <Button onClick={() => openStaffModal()}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Personal
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length > 0 ? (
                staff.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.role === 'barber' && (
                        `Alquiler: ${formatCurrency(member.rentAmount)} | Comisión: ${member.commissionPercentage || 0}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openStaffModal(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(member)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No hay personal registrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar a "${staffToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
