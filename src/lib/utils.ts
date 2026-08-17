import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined, currency: string = "Rs. "): string {
  if (price === null || price === undefined || isNaN(price)) return `${currency}0`;
  const hasDecimals = price % 1 !== 0;
  const numStr = hasDecimals
    ? price.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(price).toLocaleString("en-PK");
  return `${currency}${numStr}`;
}

export function calculateDiscountPercentage(original: number, sale: number): number {
  if (!original || original <= 0 || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export const SHOE_SIZES = ["39", "40", "41", "42", "43", "44", "45"];

export const ORDER_STATUSES = [
  { value: "PENDING", label: "Order Placed", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "PROCESSING", label: "Processing", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { value: "SHIPPED", label: "Shipped", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "DELIVERED", label: "Delivered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { value: "RETURNED", label: "Returned", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
];
