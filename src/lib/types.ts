export type Role = 'admin' | 'recepcionista' | 'unauthenticated' | 'loading';

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'barberia' | 'nordico' | 'zona gamer';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'barber' | 'recepcionista' | 'limpieza';
  rentAmount?: number;
  commissionPercentage?: number;
  monthlyPayment?: number;
}

export interface Customer {
  id: string;
  name: string;
  dob?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  customerId: string;
  barberId: string;
  items: TicketItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed';
  startTime: Date;
  endTime: Date;
  recordedBy?: string | null;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: Date;
  staffId?: string;
}

export interface TicketItem {
  id: string;
  name:string;
  price: number;
  quantity: number;
  type: 'service' | 'product';
  category: string;
}

export interface ActiveTicket {
  id: string;
  customerId: string;
  barberId: string;
  startTime: Date;
  status: 'active';
  items: TicketItem[];
  totalAmount: number;
}

export interface AppSettings {
  bcvRate: number;
}
