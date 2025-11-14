'use client';

import { useState } from 'react';
import type { Service, Product } from '@/lib/types';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Scissors, Package, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceForm, ProductForm } from './inventory-forms';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function ServicesTable() {
  const { services, openModal, addOrEdit, handleDelete } = useAppState();
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);

  const openServiceModal = (service: Service | null = null) => {
    openModal(
      <ServiceForm
        isEditing={!!service}
        onSave={(data) => addOrEdit('services', data, service?.id)}
        initialData={service}
      />,
      service ? 'Editar Servicio' : 'Agregar Servicio'
    );
  };
  
  const confirmDelete = (item: {id: string; name: string}) => setItemToDelete(item);

  const onConfirmDelete = () => {
    if (itemToDelete) {
      handleDelete('services', itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Scissors /> Servicios</CardTitle>
            <Button onClick={() => openServiceModal()}><Plus className="mr-2 h-4 w-4" /> Añadir</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? services.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{formatCurrency(s.price)}</TableCell>
                  <TableCell className="capitalize">{s.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openServiceModal(s)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center">No hay servicios.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el servicio "${itemToDelete?.name}"?`}
      />
    </>
  );
}

export function ProductsTable() {
  const { products, openModal, addOrEdit, handleDelete } = useAppState();
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);


  const openProductModal = (product: Product | null = null) => {
    openModal(
      <ProductForm
        isEditing={!!product}
        onSave={(data) => addOrEdit('products', data, product?.id)}
        initialData={product}
      />,
      product ? 'Editar Producto' : 'Agregar Producto'
    );
  };
  
  const confirmDelete = (item: {id: string; name: string}) => setItemToDelete(item);

  const onConfirmDelete = () => {
    if (itemToDelete) {
      handleDelete('products', itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Package/> Productos</CardTitle>
            <Button onClick={() => openProductModal()}><Plus className="mr-2 h-4 w-4" /> Añadir</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{formatCurrency(p.price)}</TableCell>
                  <TableCell>{formatCurrency(p.cost)}</TableCell>
                  <TableCell>
                    <Badge variant={p.stock < 10 ? 'destructive' : 'secondary'}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openProductModal(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center">No hay productos.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el producto "${itemToDelete?.name}"?`}
      />
    </>
  );
}
