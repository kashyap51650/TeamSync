"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/types";
import type { TaskStatus } from "@/types";
import { TaskCard } from "./task-card";

export function DraggableTaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
    >
      <TaskCard task={task} dragHandleListeners={listeners} onStatusChange={onStatusChange} />
    </div>
  );
}
