import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind utility class names while preserving shadcn/ui variant styles.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
