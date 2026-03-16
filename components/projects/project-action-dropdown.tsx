"use client";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CreateTaskDialog } from "../task/create-task-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { deleteProjectAction } from "@/actions/project";
import { useState } from "react";
import { TaskStatus, TeamMemberDropdownItem } from "@/types";
import { Project } from "@prisma/client";

export function ProjectActionDropdown({
  projectId,
  members,
  project,
}: Readonly<{
  projectId: string;
  members: TeamMemberDropdownItem[];
  project: Project;
}>) {
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [createForStatus, setCreateForStatus] = useState<TaskStatus>("TODO");

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setCreateForStatus("TODO");
          setCreatingTask(true);
        }}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
      </Button>
      <Button size="sm" onClick={() => setAddingMember(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Member
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setEditingProject(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => deleteProjectAction(projectId)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Dialogs ── */}
      <CreateTaskDialog
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
        projectId={projectId}
        defaultStatus={createForStatus}
        members={members}
      />

      {editingProject && (
        <EditProjectDialog
          open={editingProject}
          onClose={() => setEditingProject(false)}
          project={project}
        />
      )}

      <AddMemberDialog
        open={addingMember}
        onClose={() => setAddingMember(false)}
        projectId={projectId}
        users={members}
      />
    </>
  );
}
