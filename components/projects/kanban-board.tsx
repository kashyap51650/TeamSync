"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useOptimistic, useTransition, useState } from "react";
import { updateTaskAction } from "@/actions/task";
import { KANBAN_COLUMNS } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { KanbanColumn } from "../kanban-columns";
import { TaskCard } from "../task/task-card";

interface KanbanBoardProps {
  projectId: string;
  initialTasks: Task[];
  users: { id: string; name: string }[];
}

export function KanbanBoard({ projectId, initialTasks, users }: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [optimisticTasks, setOptimisticStatus] = useOptimistic(
    initialTasks,
    (tasks, { taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = optimisticTasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const current = initialTasks.find((t) => t.id === taskId);
    if (!current || current.status === newStatus) return;

    startTransition(async () => {
      setOptimisticStatus({ taskId, newStatus });
      await updateTaskAction(taskId, { status: newStatus });
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask((event.active.data.current?.task as Task) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    handleStatusChange(active.id as string, over.id as TaskStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("grid grid-cols-5 gap-2 pb-4", isPending && "pointer-events-none")}>
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            projectId={projectId}
            members={users}
            status={status}
            tasks={tasksByStatus[status]}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Ghost card that follows the cursor while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTask ? (
          <div className="rotate-1 shadow-xl opacity-95">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
