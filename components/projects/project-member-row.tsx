"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getInitials } from "@/lib/utils";
import { removeProjectMemberAction, forceRemoveProjectMemberAction } from "@/actions/project";
import { useRouter } from "next/navigation";

interface ProjectMemberRowProps {
  member: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  };
  projectId: string;
  taskCount: number;
  doneCount: number;
}

export function ProjectMemberRow({
  member,
  projectId,
  taskCount,
  doneCount,
}: Readonly<ProjectMemberRowProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showForceWarning, setShowForceWarning] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<
    Array<{ id: string; title: string; status: string }>
  >([]);

  const handleRemoveClick = async () => {
    const result = await removeProjectMemberAction(projectId, member.userId);

    if (result.warning) {
      setPendingTasks(result.tasks || []);
      setShowForceWarning(true);
      setIsOpen(false);
    } else if (result.success) {
      router.refresh();
    }
  };

  const handleForceRemove = async () => {
    const result = await forceRemoveProjectMemberAction(projectId, member.userId);

    if (result.success) {
      setShowForceWarning(false);
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50 group">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.user.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(member.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{member.user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium">{taskCount} tasks</p>
          <p className="text-xs text-muted-foreground">{doneCount} done</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove confirmation dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title="Remove from Project?"
        description={`Remove ${member.user.name} from this project?`}
        type="danger"
        confirmText="Remove"
        onConfirm={handleRemoveClick}
        onCancel={() => setIsOpen(false)}
      />

      {/* Force remove dialog (with task warnings) */}
      <ConfirmDialog
        isOpen={showForceWarning}
        title="Member has Active Tasks"
        type="warning"
        confirmText="Unassign & Remove"
        onConfirm={handleForceRemove}
        onCancel={() => setShowForceWarning(false)}
      >
        <div className="space-y-3">
          <p className="text-sm text-amber-900 bg-amber-50 p-2 rounded">
            {member.user.name} has {pendingTasks.length} active task
            {pendingTasks.length !== 1 ? "s" : ""} assigned:
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingTasks.map((task) => (
              <div key={task.id} className="text-sm p-2 bg-muted rounded border border-border">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.status}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            These tasks will be unassigned when you remove this member.
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
}
