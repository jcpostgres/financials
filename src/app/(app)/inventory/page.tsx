'use client';

import { PageHeader } from '@/components/common/page-header';
import { ServicesTable, ProductsTable } from './inventory-tables';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario y Servicios"
        description="Gestiona los productos y servicios ofrecidos en la barbería."
      />
      <div className="space-y-8">
        <ServicesTable />
        <ProductsTable />
      </div>
    </div>
  );
}
