import React from "react";
import { useDragManager } from "./dnd-core";

interface SortableContextValue {
  items: Array<{ id: string }>;
}

const SortableContext = React.createContext<SortableContextValue | null>(null);

export function SortableContextProvider({ items, children }: { items: Array<{ id: string }>; children: React.ReactNode }) {
  return <SortableContext.Provider value={{ items }}>{children}</SortableContext.Provider>;
}

export function useSortable({ id }: { id: string }) {
  const { setActive, onDragEnd } = useDragManager();
  const handleDragStart = () => {
    setActive(id);
  };
  const handleDragEnd = () => {
    onDragEnd?.({ active: { id }, over: { id } });
    setActive(null);
  };
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
  };
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  const setNodeRef = (node: HTMLElement | null) => {
    if (!node) return;
    node.setAttribute("draggable", "true");
    node.addEventListener("dragstart", handleDragStart);
    node.addEventListener("dragend", handleDragEnd);
  };
  return {
    setNodeRef,
    attributes: { role: "option" },
    listeners: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
    },
    transform: null,
    transition: null,
    isDragging: false,
  };
}

export function arrayMove<T>(array: T[], from: number, to: number) {
  const copy = [...array];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export const sortableKeyboardCoordinates = () => null;
