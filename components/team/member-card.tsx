"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { TeamMember as TeamMemberType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, getInitials } from "@/lib/utils";
import { Crown, Shield, User } from "lucide-react";
import { removeTeamMemberAction, forceRemoveTeamMemberAction } from "@/actions/organization";
import { useRouter } from "next/navigation";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-amber-500" },
  MANAGER: { label: "Manager", icon: Shield, color: "text-blue-500" },
  MEMBER: { label: "Member", icon: User, color: "text-muted-foreground" },
};

interface MemberCardProps {
  member: TeamMemberType;
  organizationId: string;
}

export function MemberCard({ member, organizationId }: Readonly<MemberCardProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showForceWarning, setShowForceWarning] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      project: { id: string; name: string };
    }>
  >([]);

  const roleConfig = ROLE_CONFIG[member.role];

  const handleRemoveClick = async () => {
    const result = await removeTeamMemberAction(organizationId, member.user.id);

    if (result.warning) {
      setPendingTasks(result.tasks || []);
      setShowForceWarning(true);
      setIsOpen(false);
    } else if (result.success) {
      router.refresh();
    }
  };

  const handleForceRemove = async () => {
    const result = await forceRemoveTeamMemberAction(organizationId, member.user.id);

    if (result.success) {
      setShowForceWarning(false);
      router.refresh();
    }
  };

  return (
    <>
      <Card className="transition-all hover:shadow-sm py-0">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {getInitials(member.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{member.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <roleConfig.icon className={`h-3 w-3 ${roleConfig.color}`} />
              {roleConfig.label}
            </Badge>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Joined {formatDate(member.joinedAt)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setIsOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Remove confirmation dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title="Remove from Organization?"
        description={`Remove ${member.user.name} from this organization?`}
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
                <p className="text-xs text-muted-foreground">
                  {task.project.name} · {task.status}
                </p>
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
