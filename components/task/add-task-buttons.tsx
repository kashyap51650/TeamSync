"use client";

import { Plus } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { useState } from "react";
import { TaskStatus } from "@/types";
import { Button } from "../ui/button";

export const InlineTaskCreateButton = ({
  projectId,
  members,
  createForStatus,
}: {
  projectId: string;
  members: { id: string; name: string }[];
  createForStatus?: TaskStatus;
}) => {
  const [creatingTask, setCreatingTask] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setCreatingTask(true);
        }}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary/70"
      >
        <Plus className="h-3.5 w-3.5" /> Add Task
      </button>

      <CreateTaskDialog
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
        projectId={projectId}
        defaultStatus={createForStatus}
        members={members}
      />
    </>
  );
};

export const IconOnlyTaskCreateButton = ({
  projectId,
  members,
  createForStatus,
}: {
  projectId: string;
  members: { id: string; name: string }[];
  createForStatus?: TaskStatus;
}) => {
  const [creatingTask, setCreatingTask] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setCreatingTask(true);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <CreateTaskDialog
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
        projectId={projectId}
        defaultStatus={createForStatus}
        members={members}
      />
    </>
  );
};
