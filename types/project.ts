import { Task } from "./task";
import { User } from "./user";

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;

  owner?: User;
  tasks?: Task[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}
