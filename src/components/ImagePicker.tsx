import React from "react";
import { Input } from "@/components/ui/input";

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ImagePicker({ label, value, onChange, description }: ImagePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://" type="url" />
      {value ? (
        <div className="overflow-hidden rounded-md border border-slate-200">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}
