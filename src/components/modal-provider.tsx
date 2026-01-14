'use client';

import { useAppState } from '@/hooks/use-app-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ModalProvider() {
  const { modal, closeModal } = useAppState();

  if (!modal.isOpen) {
    return null;
  }

  return (
    <Dialog open={modal.isOpen} onOpenChange={closeModal}>
      <DialogContent className="p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{modal.title}</DialogTitle>
        </DialogHeader>
        {modal.content}
      </DialogContent>
    </Dialog>
  );
}
