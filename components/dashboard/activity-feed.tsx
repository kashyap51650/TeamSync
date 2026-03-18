"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelative, getInitials, TASK_STATUS_CONFIG } from "@/lib/utils";
import type { Task } from "@/types";
import { use } from "react";

function ActivityItem({ task }: Readonly<{ task: Task }>) {
  const statusConfig = TASK_STATUS_CONFIG[task.status];

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
        <AvatarImage src={task.assignedTo?.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
          {task.assignedTo ? getInitials(task.assignedTo.name) : "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium truncate block">{task.title}</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${statusConfig.textColor}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.color}`}
            />
            {statusConfig.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
            · {formatRelative(task.updatedAt)}
          </span>
        </div>
        {task.project && (
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
            in{" "}
            <span className="font-medium" style={{ color: task.project.color }}>
              {task.project.name}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({ data }: Readonly<{ data: Promise<Task[]> }>) {
  const tasks = use(data);
  const recent = [...(tasks ?? [])]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Your latest task updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          recent.map((task) => <ActivityItem key={task.id} task={task} />)
        )}
      </CardContent>
    </Card>
  );
}
