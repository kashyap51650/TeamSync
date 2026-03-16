import { TaskStatus } from "@/types";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  XCircle,
} from "lucide-react";

export const KANBAN_COLUMNS: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const STATUS_ICONS = {
  BACKLOG: Circle,
  TODO: CircleDot,
  IN_PROGRESS: Clock,
  IN_REVIEW: AlertCircle,
  DONE: CheckCircle2,
  CANCELLED: XCircle,
};

export const STATUS_PIE_COLORS: Record<string, string> = {
  BACKLOG: "#94a3b8",
  TODO: "#60a5fa",
  IN_PROGRESS: "#fbbf24",
  IN_REVIEW: "#a78bfa",
  DONE: "#34d399",
  CANCELLED: "#f87171",
};

export const PROJECT_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];
