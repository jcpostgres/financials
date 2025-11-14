import type { Service, Product, Staff, Customer } from './types';

export const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabello', price: 15, category: 'barberia', description: 'Corte clásico con máquina y tijera.' },
  { id: '2', name: 'Afeitado de Barba', price: 10, category: 'barberia', description: 'Afeitado con navaja y toallas calientes.' },
  { id: '3', name: 'Corte y Barba', price: 22, category: 'barberia', description: 'Servicio completo de corte y arreglo de barba.' },
  { id: '4', name: 'Tinte de Cabello', price: 30, category: 'nordico', description: 'Coloración profesional para el cabello.' },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Cera para Peinar', price: 12, cost: 6, stock: 50, category: 'Cuidado Capilar' },
  { id: 'p2', name: 'Aceite para Barba', price: 15, cost: 7, stock: 40, category: 'Cuidado de Barba' },
  { id: 'p3', name: 'Refresco', price: 2, cost: 1, stock: 100, category: 'Bebidas' },
  { id: 'p4', name: 'Bebida de Cortesía', price: 0, cost: 0, stock: 9999, category: 'Cortesía' },
];

export const mockStaff: Staff[] = [
  { id: 's1', name: 'Erik "El Vikingo"', role: 'barber', rentAmount: 150, commissionPercentage: 50 },
  { id: 's2', name: 'Bjorn "Manos de Hierro"', role: 'barber', rentAmount: 150, commissionPercentage: 50 },
  { id: 's3', name: 'Astrid', role: 'recepcionista', monthlyPayment: 800 },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Juan Pérez', dob: '1990-05-15', createdAt: new Date('2023-01-20T10:00:00Z') },
  { id: 'c2', name: 'Carlos González', dob: '1985-11-22', createdAt: new Date() },
];
