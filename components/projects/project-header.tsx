"use client";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ProjectHeader({
  projectLength,
}: Readonly<{ projectLength: number }>) {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projectLength} project{projectLength === 1 ? "" : "s"}
            in your organization
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      <CreateProjectDialog open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
