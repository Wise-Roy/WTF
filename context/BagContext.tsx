"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface BagItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
}

/** Same product in two sizes is two bag lines. */
export function bagItemKey(item: { id: string; size?: string }) {
  return `${item.id}__${item.size || ""}`;
}

interface BagContextType {
  items: BagItem[];
  isOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  addItem: (item: Omit<BagItem, "quantity">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
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
const OWNER_KEY = "wtf_bag_owner";

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  // A bag belongs to whoever filled it: logging out or switching accounts empties it,
  // while a guest's bag carries over into their login so checkout -> sign-in keeps it.
  useEffect(() => {
    if (authLoading) return;
    const owner = localStorage.getItem(OWNER_KEY);
    if (owner && owner !== userId) {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } else if (!hydrated) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { setItems(JSON.parse(stored)); } catch {}
      }
    }
    if (userId) localStorage.setItem(OWNER_KEY, userId);
    else localStorage.removeItem(OWNER_KEY);
    setHydrated(true);
  }, [authLoading, userId, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const openBag = useCallback(() => setIsOpen(true), []);
  const closeBag = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: Omit<BagItem, "quantity">) => {
    const key = bagItemKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => bagItemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          bagItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => bagItemKey(i) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => bagItemKey(i) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (bagItemKey(i) === key ? { ...i, quantity } : i))
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
