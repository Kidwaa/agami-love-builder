import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | null | boolean | number>) {
  return twMerge(clsx(inputs));
}
