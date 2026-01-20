'use client';

import { PageHeader } from '@/components/common/page-header';
import { ServicesTable, ProductsTable, SnacksTable, GamerZoneTable } from './inventory-tables';
import { useAuth } from '@/hooks/use-auth';

export default function InventoryPage() {
  const { location } = useAuth();

  if (location === 'PSYFN') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inventario de la Planta"
          description="Gestiona los productos que vende la planta."
        />
        <div className="space-y-8">
          <ProductsTable />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario y Servicios"
        description="Gestiona los productos y servicios ofrecidos en la barbería."
      />
      <div className="space-y-8">
        <ServicesTable />
        <ProductsTable />
        <SnacksTable />
        <GamerZoneTable />
      </div>
    </div>
  );
}
