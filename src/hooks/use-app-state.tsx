'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { 
  Service, Product, Staff, Customer, Transaction, Expense, ActiveTicket, AppSettings, TicketItem, Withdrawal, DailyClose
} from '@/lib/types';
import { mockServices, mockProducts, mockStaff, mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './use-auth';
import { loadLocationData, saveLocationData } from '@/lib/firestoreService';

interface LocationData {
  services: Service[];
  products: Product[];
  staff: Staff[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  withdrawals: Withdrawal[];
  dailyCloses: DailyClose[];
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
  addOrEdit: (collectionName: keyof Omit<LocationData, 'appSettings' | 'barberTurnQueue' | 'activeTickets'>, data: any, id?: string) => void;
  handleDelete: (collectionName: keyof Omit<LocationData, 'appSettings' | 'barberTurnQueue' | 'activeTickets'>, id: string) => void;
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
  updatePassword: (password: string) => void;
  // Cash Register
  closeCashRegister: (summary: Omit<DailyClose, 'id' | 'location'>) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const initialLocationData: LocationData = {
  services: mockServices,
  products: mockProducts,
  staff: mockStaff,
  customers: mockCustomers,
  transactions: [],
  expenses: [],
  withdrawals: [],
  dailyCloses: [],
  barberTurnQueue: ['s1'],
  activeTickets: [],
  appSettings: { bcvRate: 36.5, password: 'ADMI14' },
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { location, isLoggedIn } = useAuth();
  
  const [allData, setAllData] = useState<Record<string, LocationData>>({});

  useEffect(() => {
    // On login, try to load remote data from Firestore for the current location.
    if (isLoggedIn && location) {
      (async () => {
        try {
          const remote = await loadLocationData(location);
          if (remote) {
            // Ensure default password if not present
            if (!remote.appSettings) remote.appSettings = initialLocationData.appSettings;
            if (!remote.appSettings.password) remote.appSettings.password = 'ADMI14';
            setAllData(prev => ({ ...prev, [location]: remote }));
            return;
          }

          // If there's no remote data, initialize Firestore document with defaults
          try {
            await saveLocationData(location, initialLocationData);
            setAllData(prev => ({ ...prev, [location]: initialLocationData }));
          } catch (e) {
            console.error('Failed to create initial remote data', e);
          }
        } catch (error) {
          console.error('Failed to load data from Firestore/localStorage', error);
        }
      })();
    }
  }, [isLoggedIn, location]);

  useEffect(() => {
    if (isLoggedIn && Object.keys(allData).length > 0) {
      // Persist current location to Firestore (best-effort)
      if (location && allData[location]) {
        saveLocationData(location, allData[location] as Partial<LocationData>).catch(err => {
          console.error('Failed to save location data to Firestore', err);
        });
      }
    }
  }, [allData, isLoggedIn, location]);

  const currentLocationData = useMemo(() => {
    if (!location) return initialLocationData;
    const dataForLocation = allData[location] || initialLocationData;
    if (!dataForLocation.appSettings.password) {
        dataForLocation.appSettings.password = 'ADMI14';
    }
    return dataForLocation;
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

  const addOrEdit = useCallback((collectionName: keyof Omit<LocationData, 'appSettings' | 'barberTurnQueue' | 'activeTickets'>, data: any, id?: string) => {
    let successMessage = '';

    const processData = (currentData: LocationData): LocationData => {
        const dataToSave = { ...data };
        Object.keys(dataToSave).forEach(key => {
            if (['price', 'cost', 'stock', 'rentAmount', 'commissionPercentage', 'amount', 'monthlyPayment'].includes(key)) {
                dataToSave[key] = Number(dataToSave[key] || 0);
            }
        });

        let updatedCollection;
        if (id) {
            updatedCollection = (currentData[collectionName] as any[]).map(item => item.id === id ? { ...item, ...dataToSave } : item);
            successMessage = 'Elemento actualizado.';
        } else {
            const newItem = { ...dataToSave, id: crypto.randomUUID() };
             if (collectionName === 'expenses' || collectionName === 'withdrawals') {
                newItem.timestamp = new Date();
            } else if (collectionName !== 'transactions') {
                newItem.createdAt = new Date();
            }
            updatedCollection = [...(currentData[collectionName] as any[]), newItem];
            successMessage = 'Elemento agregado.';
        }
        return { ...currentData, [collectionName]: updatedCollection };
    };

    updateCurrentLocationData(processData);
    closeModal();
    toast({ title: "Éxito", description: successMessage });
  }, [toast, location]);
  
  const handleDelete = useCallback((collectionName: keyof Omit<LocationData, 'appSettings' | 'barberTurnQueue' | 'activeTickets'>, id: string) => {
    let successMessage = 'Elemento eliminado.';
    const processData = (currentData: LocationData): LocationData => {
        const updatedCollection = (currentData[collectionName] as any[]).filter(item => item.id !== id);
        return { ...currentData, [collectionName]: updatedCollection };
    };
    updateCurrentLocationData(processData);
    closeModal();
    toast({ title: "Éxito", description: successMessage });
  }, [toast, location]);

  const addBarberToQueue = useCallback((barberId: string) => {
    if (!barberId) {
        toast({ title: "Error", description: 'Seleccione un barbero.', variant: "destructive"});
        return;
    }

    let successMessage: string | null = null;
    let variant: "default" | "destructive" = "default";
    
    updateCurrentLocationData(prev => {
        if (prev.barberTurnQueue.includes(barberId)) {
            successMessage = 'Este barbero ya está en la cola.';
            return prev;
        }
        successMessage = 'Barbero añadido a la cola.';
        return { ...prev, barberTurnQueue: [...prev.barberTurnQueue, barberId] };
    });
    
    if (successMessage) {
        closeModal();
        toast({ title: "Información", description: successMessage, variant });
    }
  }, [toast, location]);

  const removeBarberFromQueue = useCallback((barberId: string) => {
     updateCurrentLocationData(prev => ({
        ...prev,
        barberTurnQueue: prev.barberTurnQueue.filter(id => id !== barberId)
     }));
    toast({ title: "Éxito", description: 'Barbero removido de la cola.'});
  }, [toast, location]);
  
  const rotateBarberInQueue = useCallback((barberId: string) => {
    updateCurrentLocationData(prev => {
        const newQueue = prev.barberTurnQueue.filter(id => id !== barberId);
        newQueue.push(barberId);
        return { ...prev, barberTurnQueue: newQueue };
    });
    toast({ title: "Turno Finalizado", description: 'El barbero ha sido movido al final de la cola.'});
  }, [toast, location]);

  const clearBarberQueue = useCallback(() => {
    updateCurrentLocationData(prev => ({ ...prev, barberTurnQueue: [] }));
    toast({ title: "Cola Limpiada", description: 'Se han eliminado todos los barberos de la cola.'});
  }, [toast, location]);
  
  const moveBarberInQueue = useCallback((barberId: string, direction: 'up' | 'down') => {
      updateCurrentLocationData(prev => {
          const currentIndex = prev.barberTurnQueue.indexOf(barberId);
          if (currentIndex === -1) return prev;

          const newIndex = direction === 'up'
              ? Math.max(0, currentIndex - 1)
              : Math.min(prev.barberTurnQueue.length - 1, currentIndex + 1);

          if (newIndex === currentIndex) return prev;

          const newQueue = [...prev.barberTurnQueue];
          const [movedBarber] = newQueue.splice(currentIndex, 1);
          newQueue.splice(newIndex, 0, movedBarber);
          return { ...prev, barberTurnQueue: newQueue };
      });
      toast({ title: "Éxito", description: 'Cola de barberos actualizada.'});
  }, [toast, location]);

  const startService = useCallback((customerId: string, barberId: string, items: TicketItem[], totalAmount: number) => {
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
    
    closeModal();
    toast({ title: "Éxito", description: 'Servicio iniciado.'});
  }, [toast, location]);
  
  const addItemToTicket = useCallback((ticketId: string, item: Service | Product, type: 'service' | 'product') => {
    updateCurrentLocationData(prev => {
      const newActiveTickets = prev.activeTickets.map(ticket => {
          if (ticket.id === ticketId) {
              const newItem: TicketItem = { id: item.id, name: item.name, price: Number(item.price), type, quantity: 1, category: item.category as string };
              const updatedItems = [...ticket.items, newItem];
              const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              return { ...ticket, items: updatedItems, totalAmount: newTotal };
          }
          return ticket;
      });
      return { ...prev, activeTickets: newActiveTickets };
    });
    closeModal();
    toast({ title: "Éxito", description: `${item.name} añadido al ticket.`});
  }, [toast, location]);

  const finalizePayment = useCallback((ticket: ActiveTicket, paymentMethod: string, referenceNumber?: string) => {
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

      const newBarberTurnQueue = [...prev.barberTurnQueue];
      if (ticket.barberId && !newBarberTurnQueue.includes(ticket.barberId)) {
        newBarberTurnQueue.push(ticket.barberId);
      }
      
      return {
        ...prev,
        transactions: [...prev.transactions, newTransaction],
        activeTickets: prev.activeTickets.filter(t => t.id !== ticket.id),
        products: updatedProducts,
        barberTurnQueue: newBarberTurnQueue
      };
    });
    closeModal();
    toast({ title: "Éxito", description: 'Venta finalizada y registrada.'});
  }, [toast, location]);

  const updateBcvRate = useCallback((rate: number) => {
    if (isNaN(rate) || rate <= 0) {
      toast({ title: "Error", description: 'Ingrese una tasa de BCV válida.', variant: "destructive"});
      return;
    }
    updateCurrentLocationData(prev => ({
        ...prev,
        appSettings: { ...prev.appSettings, bcvRate: rate }
    }));
    toast({ title: "Éxito", description: 'Tasa BCV actualizada.'});
  }, [toast, location]);

  const updatePassword = useCallback((password: string) => {
    if (password.length < 4) {
        toast({ title: 'Error', description: 'La contraseña debe tener al menos 4 caracteres.', variant: 'destructive' });
        return;
    }
    updateCurrentLocationData(prev => ({
        ...prev,
        appSettings: { ...prev.appSettings, password }
    }));
    toast({ title: 'Éxito', description: 'Contraseña actualizada.' });
  }, [toast, location]);
  
  const closeCashRegister = useCallback((summary: Omit<DailyClose, 'id' | 'location'>) => {
    if (!location) return;

    const newClose: DailyClose = {
        id: crypto.randomUUID(),
        location: location,
        ...summary,
    };

    updateCurrentLocationData(prev => ({
        ...prev,
        dailyCloses: [...(prev.dailyCloses || []), newClose],
    }));

    toast({
        title: 'Cierre de Caja Realizado',
        description: 'El resumen del día ha sido registrado.',
    });
}, [location, toast]);

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
    updateBcvRate,
    updatePassword,
    closeCashRegister
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
