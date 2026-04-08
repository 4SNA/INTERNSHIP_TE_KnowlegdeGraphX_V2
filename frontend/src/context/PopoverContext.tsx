'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopoverData {
  anchor: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: () => void;
}

interface PopoverContextType {
  activePopover: PopoverData | null;
  openPopover: (data: PopoverData) => void;
  closePopover: () => void;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export function PopoverProvider({ children }: { children: ReactNode }) {
  const [activePopover, setActivePopover] = useState<PopoverData | null>(null);

  const openPopover = (data: PopoverData) => setActivePopover(data);
  const closePopover = () => setActivePopover(null);

  return (
    <PopoverContext.Provider value={{ activePopover, openPopover, closePopover }}>
      {children}
    </PopoverContext.Provider>
  );
}

export function usePopover() {
  const context = useContext(PopoverContext);
  if (context === undefined) {
    throw new Error('usePopover must be used within a PopoverProvider');
  }
  return context;
}
