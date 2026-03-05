export interface Activity {
  id: string;

  action: string;

  userId: string;
  projectId?: string;
  taskId?: string;

  createdAt: Date;
}
