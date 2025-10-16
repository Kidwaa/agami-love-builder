import React from "react";

export interface DragEndEvent {
  active: { id: string };
  over?: { id: string } | null;
}

interface ContextValue {
  onDragEnd?: (event: DragEndEvent) => void;
  setActive: (id: string | null) => void;
  activeId: string | null;
}

const DragContext = React.createContext<ContextValue | null>(null);

export function DndContext({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void }) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const setActive = React.useCallback((id: string | null) => {
    setActiveId(id);
  }, []);
  const value = React.useMemo(() => ({ onDragEnd, setActive, activeId }), [onDragEnd, setActive, activeId]);
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}

export function useDragManager() {
  const ctx = React.useContext(DragContext);
  if (!ctx) throw new Error("useDragManager must be used within DndContext");
  return ctx;
}

export function useSensors() {
  return null;
}

export function useSensor() {
  return null;
}

export const PointerSensor = {};

export function closestCenter<T>(items: T) {
  return items;
}
