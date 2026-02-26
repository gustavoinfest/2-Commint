import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  // Add country code if missing (assuming Brazil +55)
  const formattedPhone = cleanPhone.length === 11 || cleanPhone.length === 10 
    ? `55${cleanPhone}` 
    : cleanPhone;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
