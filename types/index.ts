// src/types/index.ts

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";
export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";
export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NO_PRIORITY";
export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "PROJECT_UPDATED"
  | "MENTION"
  | "TEAM_INVITE";

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}

// ─── Organization ────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
}

// ─── Team Member ─────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  joinedAt: string;
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
}

export type TeamMemberDropdownItem = {
  id: string;
  name: string;
};

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  organizationId: string;
  createdById: string;
  startDate?: Date | null;
  endDate?: Date | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    tasks: number;
    members: number;
  };
}

// ─── Task ────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
  dueDate?: Date | null;
  position: number;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  project?: Pick<Project, "id" | "name" | "color">;
  assignedTo?: Pick<User, "id" | "name" | "avatarUrl"> | null;
  createdBy?: Pick<User, "id" | "name">;
  labels?: TaskLabel[];
  _count?: {
    activities: number;
  };
}

export interface TaskLabel {
  id: string;
  taskId: string;
  name: string;
  color: string;
}

// ─── Task Activity ───────────────────────────────────────────────────────────
export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByStatus: Record<TaskStatus, number>;
}

export interface TeamAnalytics {
  totalMembers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  productivity: DailyProductivity[];
}

export interface DailyProductivity {
  date: string;
  created: number;
  completed: number;
}

export interface WorkloadDistribution {
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  taskCount: number;
  completedCount: number;
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── SSE Events ──────────────────────────────────────────────────────────────
export type SSEEventType =
  | "task:created"
  | "task:updated"
  | "task:deleted"
  | "task:status_changed"
  | "project:updated"
  | "notification:new"
  | "member:joined";

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}
