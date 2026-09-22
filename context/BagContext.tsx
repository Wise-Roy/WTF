"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface BagItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface BagContextType {
  items: BagItem[];
  isOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  addItem: (item: Omit<BagItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearBag: () => void;
  itemCount: number;
  subtotal: number;
}

const BagContext = createContext<BagContextType>({
  items: [],
  isOpen: false,
  openBag: () => {},
  closeBag: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearBag: () => {},
  itemCount: 0,
  subtotal: 0,
});

const STORAGE_KEY = "wtf_bag";

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const openBag = useCallback(() => setIsOpen(true), []);
  const closeBag = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: Omit<BagItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearBag = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <BagContext.Provider
      value={{
        items,
        isOpen,
        openBag,
        closeBag,
        addItem,
        removeItem,
        updateQuantity,
        clearBag,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  return useContext(BagContext);
}
