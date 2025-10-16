import React from "react";
import { cn } from "@/utils/cn";

interface PhonePreviewProps {
  title: string;
  children: React.ReactNode;
}

export function PhonePreview({ title, children }: PhonePreviewProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <div
        className={cn(
          "relative w-72 rounded-[2rem] border-[12px] border-slate-900 bg-slate-900 p-3 shadow-lg",
          "after:absolute after:left-1/2 after:top-1 after:h-1 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-slate-700"
        )}
      >
        <div className="h-[520px] overflow-hidden rounded-[1.5rem] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
