'use client';

import { useState } from 'react';
import type { Service, Product } from '@/lib/types';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Scissors, Package, Trash2, Sandwich, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceForm, ProductForm } from './inventory-forms';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function ServicesTable() {
  const { services, openModal, addOrEdit, handleDelete } = useAppState();
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);

  const barberiaServices = services.filter(s => s.category === 'barberia');

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
            <CardTitle className="flex items-center gap-2"><Scissors /> Servicios de Barbería</CardTitle>
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
              {barberiaServices.length > 0 ? barberiaServices.map(s => (
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
  
  const regularProducts = products.filter(p => p.category !== 'Snack');

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
              {regularProducts.length > 0 ? regularProducts.map(p => (
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

export function SnacksTable() {
  const { products, openModal, addOrEdit, handleDelete } = useAppState();
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);
  
  const snackProducts = products.filter(p => p.category === 'Snack');

  const openSnackModal = (product: Product | null = null) => {
    const initialData = product || { category: 'Snack' };
    openModal(
      <ProductForm
        isEditing={!!product}
        onSave={(data) => addOrEdit('products', { ...data, category: 'Snack' }, product?.id)}
        initialData={initialData}
      />,
      product ? 'Editar Snack' : 'Agregar Snack'
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
            <CardTitle className="flex items-center gap-2"><Sandwich /> Snacks</CardTitle>
            <Button onClick={() => openSnackModal()}><Plus className="mr-2 h-4 w-4" /> Añadir</Button>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snackProducts.length > 0 ? snackProducts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{formatCurrency(p.price)}</TableCell>
                  <TableCell>{formatCurrency(p.cost)}</TableCell>
                  <TableCell>
                    <Badge variant={p.stock < 10 ? 'destructive' : 'secondary'}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openSnackModal(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="text-center">No hay snacks.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Está seguro de que desea eliminar el snack "${itemToDelete?.name}"?`}
      />
    </>
  );
}

export function GamerZoneTable() {
  const { services, openModal, addOrEdit, handleDelete } = useAppState();
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);

  const gamerServices = services.filter(s => s.category === 'zona gamer');

  const openGamerServiceModal = (service: Service | null = null) => {
    const initialData = service || { category: 'zona gamer', price: 0 };
    openModal(
      <ServiceForm
        isEditing={!!service}
        onSave={(data) => addOrEdit('services', { ...data, category: 'zona gamer' }, service?.id)}
        initialData={initialData}
      />,
      service ? 'Editar Servicio Gamer' : 'Agregar Servicio Gamer'
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
            <CardTitle className="flex items-center gap-2"><Gamepad2 /> Zona Gamer</CardTitle>
            <Button onClick={() => openGamerServiceModal()}><Plus className="mr-2 h-4 w-4" /> Añadir</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio (por hora)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gamerServices.length > 0 ? gamerServices.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{formatCurrency(s.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openGamerServiceModal(s)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center">No hay servicios de Zona Gamer.</TableCell></TableRow>}
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

    