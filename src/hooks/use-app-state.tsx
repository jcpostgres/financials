'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { 
  Service, Product, Staff, Customer, Transaction, Expense, ActiveTicket, AppSettings, TicketItem 
} from '@/lib/types';
import { mockServices, mockProducts, mockStaff, mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AppState {
  services: Service[];
  products: Product[];
  staff: Staff[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  barberTurnQueue: string[];
  activeTickets: ActiveTicket[];
  appSettings: AppSettings;
  modal: {
    isOpen: boolean;
    content: ReactNode | null;
    title: string;
  };
  openModal: (content: ReactNode, title: string) => void;
  closeModal: () => void;
  // CRUD
  addOrEdit: (collectionName: string, data: any, id?: string) => Promise<void>;
  handleDelete: (collectionName: string, id: string, itemName: string) => void;
  // Queue Logic
  addBarberToQueue: (barberId: string) => void;
  removeBarberFromQueue: (barberId: string) => void;
  moveBarberInQueue: (barberId: string, direction: 'up' | 'down') => void;
  rotateBarberInQueue: (barberId: string) => void;
  clearBarberQueue: () => void;
  // Ticket Logic
  startService: (customerId: string, barberId: string, items: TicketItem[], totalAmount: number) => void;
  addItemToTicket: (ticketId: string, item: Service | Product, type: 'service' | 'product') => void;
  finalizePayment: (ticket: ActiveTicket, paymentMethod: string, referenceNumber?: string) => void;
  // Settings
  updateBcvRate: (rate: number) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Data States
  const [services, setServices] = useState<Service[]>(mockServices);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [barberTurnQueue, setBarberTurnQueue] = useState<string[]>(['s1']);
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({ bcvRate: 36.5 });
  
  // UI States
  const [modal, setModal] = useState<{ isOpen: boolean; content: ReactNode | null; title: string }>({
    isOpen: false,
    content: null,
    title: '',
  });

  const openModal = (content: ReactNode, title: string) => setModal({ isOpen: true, content, title });
  const closeModal = () => setModal({ isOpen: false, content: null, title: '' });

  // CRUD Functions
  const addOrEdit = async (collectionName: string, data: any, id?: string) => {
    const dataToSave = { ...data };
      Object.keys(dataToSave).forEach(key => {
          if (['price', 'cost', 'stock', 'rentAmount', 'commissionPercentage', 'amount', 'monthlyPayment'].includes(key)) {
              dataToSave[key] = Number(dataToSave[key] || 0);
          }
      });

    const updater = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      if (id) {
        setter(prev => prev.map(item => item.id === id ? { ...item, ...dataToSave } : item));
        toast({ title: "Éxito", description: 'Elemento actualizado.', variant: "default" });
      } else {
        const newItem = { ...dataToSave, id: crypto.randomUUID() };
        if (collectionName !== 'expenses') {
          newItem.createdAt = new Date();
        }
        setter(prev => [...prev, newItem]);
        toast({ title: "Éxito", description: 'Elemento agregado.', variant: "default" });
      }
    };
    
    switch (collectionName) {
      case 'services': updater(setServices); break;
      case 'products': updater(setProducts); break;
      case 'staff': updater(setStaff); break;
      case 'customers': updater(setCustomers); break;
      case 'expenses': 
        setExpenses(prev => [...prev, { ...dataToSave, id: crypto.randomUUID(), timestamp: new Date() }]);
        toast({ title: "Éxito", description: 'Gasto registrado.', variant: "default" });
        break;
      default: 
        toast({ title: "Error", description: `Colección desconocida: ${collectionName}`, variant: "destructive"});
        return;
    }
    closeModal();
  };
  
  const handleDelete = (collectionName: string, id: string) => {
    const updater = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      setter(prev => prev.filter(item => item.id !== id));
      toast({ title: "Éxito", description: 'Elemento eliminado.', variant: "default" });
    };

    switch (collectionName) {
      case 'services': updater(setServices); break;
      case 'products': updater(setProducts); break;
      case 'staff': updater(setStaff); break;
      case 'customers': updater(setCustomers); break;
      case 'expenses': updater(setExpenses); break;
      default: 
        toast({ title: "Error", description: `Colección desconocida: ${collectionName}`, variant: "destructive"});
        return;
    }
    closeModal();
  };

  // Queue Logic
  const addBarberToQueue = (barberId: string) => {
    if (!barberId) {
      toast({ title: "Error", description: 'Seleccione un barbero.', variant: "destructive"});
      return;
    }
    if (barberTurnQueue.includes(barberId)) {
      toast({ title: "Información", description: 'Este barbero ya está en la cola.', variant: "default"});
      return;
    }
    setBarberTurnQueue(prev => [...prev, barberId]);
    toast({ title: "Éxito", description: 'Barbero añadido a la cola.', variant: "default"});
    closeModal();
  };

  const removeBarberFromQueue = (barberId: string) => {
    setBarberTurnQueue(prev => prev.filter(id => id !== barberId));
    toast({ title: "Éxito", description: 'Barbero removido de la cola.', variant: "default"});
    closeModal();
  };

  const rotateBarberInQueue = (barberId: string) => {
    setBarberTurnQueue(prevQueue => {
      const newQueue = prevQueue.filter(id => id !== barberId);
      newQueue.push(barberId);
      return newQueue;
    });
    toast({ title: "Turno Finalizado", description: 'El barbero ha sido movido al final de la cola.', variant: "default"});
  };

  const clearBarberQueue = () => {
    setBarberTurnQueue([]);
    toast({ title: "Cola Limpiada", description: 'Se han eliminado todos los barberos de la cola.', variant: "default"});
  };
  
  const moveBarberInQueue = (barberId: string, direction: 'up' | 'down') => {
      const currentIndex = barberTurnQueue.indexOf(barberId);
      if (currentIndex === -1) return;

      let newIndex;
      if (direction === 'up') {
          newIndex = Math.max(0, currentIndex - 1);
      } else {
          newIndex = Math.min(barberTurnQueue.length - 1, currentIndex + 1);
      }

      if (newIndex === currentIndex) return;

      const newQueue = [...barberTurnQueue];
      const [movedBarber] = newQueue.splice(currentIndex, 1);
      newQueue.splice(newIndex, 0, movedBarber);
      setBarberTurnQueue(newQueue);
      toast({ title: "Éxito", description: 'Cola de barberos actualizada.', variant: "default"});
  };

  // Ticket Logic
  const startService = (customerId: string, barberId: string, items: TicketItem[], totalAmount: number) => {
    if (!customerId || !barberId || items.length === 0) {
      toast({ title: "Error", description: 'Cliente, barbero y al menos un item son requeridos.', variant: "destructive"});
      return;
    }
    const newTicket: ActiveTicket = {
      id: crypto.randomUUID(),
      customerId,
      barberId,
      items,
      totalAmount,
      startTime: new Date(),
      status: 'active',
    };
    setActiveTickets(prev => [...prev, newTicket]);
    setBarberTurnQueue(prev => prev.filter(id => id !== barberId));
    toast({ title: "Éxito", description: 'Servicio iniciado.', variant: "default"});
    closeModal();
  };
  
  const addItemToTicket = (ticketId: string, item: Service | Product, type: 'service' | 'product') => {
      setActiveTickets(prevTickets => prevTickets.map(ticket => {
          if (ticket.id === ticketId) {
              const newItem: TicketItem = { id: item.id, name: item.name, price: Number(item.price), type, quantity: 1, category: item.category };
              const updatedItems = [...ticket.items, newItem];
              const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              return { ...ticket, items: updatedItems, totalAmount: newTotal };
          }
          return ticket;
      }));
      toast({ title: "Éxito", description: `${item.name} añadido al ticket.`, variant: "default"});
      closeModal();
  };

  const finalizePayment = (ticket: ActiveTicket, paymentMethod: string, referenceNumber?: string) => {
    if (!paymentMethod) {
      toast({ title: "Error", description: 'Seleccione un método de pago.', variant: "destructive"});
      return;
    }
    const newTransaction: Transaction = {
      ...ticket,
      id: crypto.randomUUID(),
      status: 'completed',
      paymentMethod,
      referenceNumber,
      endTime: new Date(),
      recordedBy: 'user-id-placeholder'
    };
    setTransactions(prev => [...prev, newTransaction]);
    setActiveTickets(prev => prev.filter(t => t.id !== ticket.id));

    // Update stock
    ticket.items.forEach(item => {
      if (item.type === 'product' && item.category !== 'Cortesía') {
        setProducts(prev => prev.map(p => 
          p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p
        ));
      }
    });

    // Add barber back to queue
    if (ticket.barberId && !barberTurnQueue.includes(ticket.barberId)) {
        setBarberTurnQueue(prev => [...prev, ticket.barberId]);
    }
    
    toast({ title: "Éxito", description: 'Venta finalizada y registrada.', variant: "default"});
    closeModal();
  };

  // Settings
  const updateBcvRate = (rate: number) => {
    if (isNaN(rate) || rate <= 0) {
      toast({ title: "Error", description: 'Ingrese una tasa de BCV válida.', variant: "destructive"});
      return;
    }
    setAppSettings({ bcvRate: rate });
    toast({ title: "Éxito", description: 'Tasa BCV actualizada.', variant: "default"});
  };

  const value: AppState = {
    services,
    products,
    staff,
    customers,
    transactions,
    expenses,
    barberTurnQueue,
    activeTickets,
    appSettings,
    modal,
    openModal,
    closeModal,
    addOrEdit,
    handleDelete,
    addBarberToQueue,
    removeBarberFromQueue,
    moveBarberInQueue,
    rotateBarberInQueue,
    clearBarberQueue,
    startService,
    addItemToTicket,
    finalizePayment,
    updateBcvRate
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

    