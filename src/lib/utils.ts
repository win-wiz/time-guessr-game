import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';