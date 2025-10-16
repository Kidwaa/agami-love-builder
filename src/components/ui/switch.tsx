import * as React from "react";
import { cn } from "@/utils/cn";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch({ className, ...props }, ref) {
  return (
    <label className={cn("relative inline-flex h-6 w-11 items-center", className)}>
      <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
      <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-indigo-500" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    </label>
  );
});
