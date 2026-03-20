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

export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

export const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const DEFAULT_NOTIFICATION_SETTINGS: Record<string, boolean> = {
  task_assigned: true,
  task_due_soon: true,
  project_updates: true,
};

// Cookie constants and options
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 15 * 60, // 15 minutes
  path: "/",
};
export const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: "/",
};
