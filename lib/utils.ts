import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date());
}

export function isDueSoon(
  dueDate: string | Date | null | undefined,
  days = 2,
): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return isAfter(d, new Date()) && isBefore(d, threshold);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Status config maps
export const TASK_STATUS_CONFIG = {
  BACKLOG: {
    label: "Backlog",
    color: "bg-gray-400",
    textColor: "text-gray-600",
  },
  TODO: { label: "To Do", color: "bg-blue-400", textColor: "text-blue-600" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-400",
    textColor: "text-amber-600",
  },
  IN_REVIEW: {
    label: "In Review",
    color: "bg-purple-400",
    textColor: "text-purple-600",
  },
  DONE: { label: "Done", color: "bg-green-400", textColor: "text-green-600" },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-400",
    textColor: "text-red-600",
  },
} as const;

export const TASK_PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", color: "text-red-500", icon: "🔴" },
  HIGH: { label: "High", color: "text-orange-500", icon: "🟠" },
  MEDIUM: { label: "Medium", color: "text-yellow-500", icon: "🟡" },
  LOW: { label: "Low", color: "text-blue-500", icon: "🔵" },
  NO_PRIORITY: { label: "No Priority", color: "text-gray-400", icon: "⚪" },
} as const;

export const PROJECT_STATUS_CONFIG = {
  PLANNING: { label: "Planning", variant: "secondary" as const },
  ACTIVE: { label: "Active", variant: "default" as const },
  ON_HOLD: { label: "On Hold", variant: "outline" as const },
  COMPLETED: { label: "Completed", variant: "default" as const },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const },
} as const;
