export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name?: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
