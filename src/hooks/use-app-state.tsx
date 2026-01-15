'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { 
  Service, Product, Staff, Customer, Transaction, Expense, ActiveTicket, AppSettings, TicketItem 
} from '@/lib/types';
import { mockServices, mockProducts, mockStaff, mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './use-auth';

interface LocationData {
  services: Service[];
  products: Product[];
  staff: Staff[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  barberTurnQueue: string[];
  activeTickets: ActiveTicket[];
  appSettings: AppSettings;
}

interface AppState extends LocationData {
  modal: {
    isOpen: boolean;
    content: ReactNode | null;
    title: string;
  };
  openModal: (content: ReactNode, title: string) => void;
  closeModal: () => void;
  // CRUD
  addOrEdit: (collectionName: keyof Omit<LocationData, 'appSettings'>, data: any, id?: string) => Promise<void>;
  handleDelete: (collectionName: keyof Omit<LocationData, 'appSettings'>, id: string) => void;
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

const initialLocationData: LocationData = {
  services: mockServices,
  products: mockProducts,
  staff: mockStaff,
  customers: mockCustomers,
  transactions: [],
  expenses: [],
  barberTurnQueue: ['s1'],
  activeTickets: [],
  appSettings: { bcvRate: 36.5 },
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { location, isLoggedIn } = useAuth();
  
  const [allData, setAllData] = useState<Record<string, LocationData>>({});

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedData = localStorage.getItem('nordicoAppData');
        if (storedData) {
          setAllData(JSON.parse(storedData, (key, value) => {
            if (key === 'startTime' || key === 'endTime' || key === 'timestamp' || key === 'createdAt') {
              return new Date(value);
            }
            return value;
          }));
        }
      } catch (error) {
        console.error("Failed to load data from localStorage", error);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      try {
        localStorage.setItem('nordicoAppData', JSON.stringify(allData));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [allData, isLoggedIn]);

  const currentLocationData = useMemo(() => {
    if (!location || !allData) return initialLocationData;
    return allData[location] || initialLocationData;
  }, [allData, location]);
  
  const updateCurrentLocationData = (updater: (prev: LocationData) => LocationData) => {
    if (!location) return;
    setAllData(prevAll => ({
      ...prevAll,
      [location]: updater(prevAll[location] || initialLocationData),
    }));
  };

  const [modal, setModal] = useState<{ isOpen: boolean; content: ReactNode | null; title: string }>({
    isOpen: false,
    content: null,
    title: '',
  });

  const openModal = (content: ReactNode, title: string) => setModal({ isOpen: true, content, title });
  const closeModal = () => setModal({ isOpen: false, content: null, title: '' });

  const addOrEdit = async (collectionName: keyof Omit<LocationData, 'appSettings'>, data: any, id?: string) => {
    const dataToSave = { ...data };
      Object.keys(dataToSave).forEach(key => {
          if (['price', 'cost', 'stock', 'rentAmount', 'commissionPercentage', 'amount', 'monthlyPayment'].includes(key)) {
              dataToSave[key] = Number(dataToSave[key] || 0);
          }
      });

    updateCurrentLocationData(prev => {
        const collection = prev[collectionName] as any[];
        let newCollection;
        if (id) {
            newCollection = collection.map(item => item.id === id ? { ...item, ...dataToSave } : item);
            toast({ title: "Éxito", description: 'Elemento actualizado.', variant: "default" });
        } else {
            const newItem = { ...dataToSave, id: crypto.randomUUID() };
            if (collectionName !== 'expenses' && collectionName !== 'transactions') {
                newItem.createdAt = new Date();
            }
             if (collectionName === 'expenses') {
                newItem.timestamp = new Date();
            }
            newCollection = [...collection, newItem];
            toast({ title: "Éxito", description: 'Elemento agregado.', variant: "default" });
        }
        return { ...prev, [collectionName]: newCollection };
    });
    
    closeModal();
  };
  
  const handleDelete = (collectionName: keyof Omit<LocationData, 'appSettings'>, id: string) => {
    updateCurrentLocationData(prev => {
      const collection = prev[collectionName] as any[];
      const newCollection = collection.filter(item => item.id !== id);
      toast({ title: "Éxito", description: 'Elemento eliminado.', variant: "default" });
      return { ...prev, [collectionName]: newCollection };
    });
    closeModal();
  };

  const addBarberToQueue = (barberId: string) => {
    if (!barberId) {
      toast({ title: "Error", description: 'Seleccione un barbero.', variant: "destructive"});
      return;
    }
    updateCurrentLocationData(prev => {
      if (prev.barberTurnQueue.includes(barberId)) {
        toast({ title: "Información", description: 'Este barbero ya está en la cola.', variant: "default"});
        return prev;
      }
      toast({ title: "Éxito", description: 'Barbero añadido a la cola.', variant: "default"});
      return { ...prev, barberTurnQueue: [...prev.barberTurnQueue, barberId] };
    });
    closeModal();
  };

  const removeBarberFromQueue = (barberId: string) => {
     updateCurrentLocationData(prev => ({
        ...prev,
        barberTurnQueue: prev.barberTurnQueue.filter(id => id !== barberId)
     }));
    toast({ title: "Éxito", description: 'Barbero removido de la cola.', variant: "default"});
  };
  
  const rotateBarberInQueue = (barberId: string) => {
    updateCurrentLocationData(prev => {
        const newQueue = prev.barberTurnQueue.filter(id => id !== barberId);
        newQueue.push(barberId);
        toast({ title: "Turno Finalizado", description: 'El barbero ha sido movido al final de la cola.', variant: "default"});
        return { ...prev, barberTurnQueue: newQueue };
    });
  };

  const clearBarberQueue = () => {
    updateCurrentLocationData(prev => ({ ...prev, barberTurnQueue: [] }));
    toast({ title: "Cola Limpiada", description: 'Se han eliminado todos los barberos de la cola.', variant: "default"});
  };
  
  const moveBarberInQueue = (barberId: string, direction: 'up' | 'down') => {
      updateCurrentLocationData(prev => {
          const currentIndex = prev.barberTurnQueue.indexOf(barberId);
          if (currentIndex === -1) return prev;

          let newIndex;
          if (direction === 'up') {
              newIndex = Math.max(0, currentIndex - 1);
          } else {
              newIndex = Math.min(prev.barberTurnQueue.length - 1, currentIndex + 1);
          }

          if (newIndex === currentIndex) return prev;

          const newQueue = [...prev.barberTurnQueue];
          const [movedBarber] = newQueue.splice(currentIndex, 1);
          newQueue.splice(newIndex, 0, movedBarber);
          toast({ title: "Éxito", description: 'Cola de barberos actualizada.', variant: "default"});
          return { ...prev, barberTurnQueue: newQueue };
      });
  };

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

    updateCurrentLocationData(prev => ({
      ...prev,
      activeTickets: [...prev.activeTickets, newTicket],
      barberTurnQueue: prev.barberTurnQueue.filter(id => id !== barberId),
    }));
    
    toast({ title: "Éxito", description: 'Servicio iniciado.', variant: "default"});
    closeModal();
  };
  
  const addItemToTicket = (ticketId: string, item: Service | Product, type: 'service' | 'product') => {
    updateCurrentLocationData(prev => {
      const newActiveTickets = prev.activeTickets.map(ticket => {
          if (ticket.id === ticketId) {
              const newItem: TicketItem = { id: item.id, name: item.name, price: Number(item.price), type, quantity: 1, category: item.category };
              const updatedItems = [...ticket.items, newItem];
              const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              return { ...ticket, items: updatedItems, totalAmount: newTotal };
          }
          return ticket;
      });
      toast({ title: "Éxito", description: `${item.name} añadido al ticket.`, variant: "default"});
      return { ...prev, activeTickets: newActiveTickets };
    });
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

    updateCurrentLocationData(prev => {
      const updatedProducts = prev.products.map(p => {
        const itemInTicket = ticket.items.find(item => item.id === p.id && item.type === 'product');
        if (itemInTicket) {
          return { ...p, stock: p.stock - itemInTicket.quantity };
        }
        return p;
      });

      const newBarberTurnQueue = prev.barberTurnQueue;
      if (ticket.barberId && !newBarberTurnQueue.includes(ticket.barberId)) {
        newBarberTurnQueue.push(ticket.barberId);
      }
      
      toast({ title: "Éxito", description: 'Venta finalizada y registrada.', variant: "default"});
      
      return {
        ...prev,
        transactions: [...prev.transactions, newTransaction],
        activeTickets: prev.activeTickets.filter(t => t.id !== ticket.id),
        products: updatedProducts,
        barberTurnQueue: newBarberTurnQueue
      };
    });
    closeModal();
  };

  const updateBcvRate = (rate: number) => {
    if (isNaN(rate) || rate <= 0) {
      toast({ title: "Error", description: 'Ingrese una tasa de BCV válida.', variant: "destructive"});
      return;
    }
    updateCurrentLocationData(prev => ({
        ...prev,
        appSettings: { ...prev.appSettings, bcvRate: rate }
    }));
    toast({ title: "Éxito", description: 'Tasa BCV actualizada.', variant: "default"});
  };

  const value: AppState = {
    ...currentLocationData,
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
