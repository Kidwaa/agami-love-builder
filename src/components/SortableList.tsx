import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/vendor/react-i18next";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T, options: { dragHandleProps: React.HTMLAttributes<HTMLButtonElement> }) => React.ReactNode;
  onReorder: (ids: string[]) => void;
  isDisabled?: boolean;
}

export function SortableList<T extends { id: string }>({ items, renderItem, onReorder, isDisabled }: SortableListProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const liveRegionRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  const handleDragStart = (id: string) => {
    if (isDisabled) return;
    setActiveId(id);
    announce(`Picked up item ${id}`);
  };

  const handleDragEnter = (targetId: string) => {
    if (isDisabled) return;
    if (!activeId || activeId === targetId) return;
    const activeIndex = items.findIndex((item) => item.id === activeId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (activeIndex === -1 || targetIndex === -1) return;
    const reordered = [...items];
    const [moved] = reordered.splice(activeIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorder(reordered.map((item) => item.id));
    announce(`Moved item to position ${targetIndex + 1}`);
  };

  const handleDrop = () => {
    if (isDisabled) return;
    setActiveId(null);
    announce("Sorting complete");
  };

  const moveBy = (id: string, delta: number) => {
    if (isDisabled) return;
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((item) => item.id));
    announce(`Moved item to position ${newIndex + 1}`);
  };

  return (
    <div className="space-y-3">
      <div className="sr-only" role="status" aria-live="polite" ref={liveRegionRef} />
      <ul role="list" aria-disabled={isDisabled} className="space-y-3">
        {items.map((item, index) => {
          return (
            <li
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              draggable={!isDisabled}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnter={() => handleDragEnter(item.id)}
              onDragEnd={handleDrop}
            >
              <div className="flex items-start gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-1 cursor-grab"
                  aria-label={`Reorder item ${index + 1}`}
                  disabled={isDisabled}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveBy(item.id, -1);
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveBy(item.id, 1);
                    }
                  }}
                >
                  <span className="text-lg">⋮⋮</span>
                </Button>
                <div className="flex-1 space-y-3">
                  {renderItem(item, {
                    dragHandleProps: {
                      "aria-describedby": "drag instructions",
                      onClick: () => handleDragStart(item.id),
                    },
                  })}
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => moveBy(item.id, -1)} disabled={isDisabled || index === 0}>
                      ↑
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => moveBy(item.id, 1)} disabled={isDisabled || index === items.length - 1}>
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p id="drag instructions" className="text-xs text-slate-500">
        {t("actions.reorder")}: drag items or use arrow buttons to move.
      </p>
    </div>
  );
}
