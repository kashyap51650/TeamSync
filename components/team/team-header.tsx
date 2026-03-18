"use client";
import { TeamMember } from "@/types";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { InviteDialog } from "./invite-dialog";

export function TeamHeader({
  members,
  orgId,
  isShowInviteButton = true,
}: Readonly<{
  members: TeamMember[];
  orgId: string;
  isShowInviteButton: boolean;
}>) {
  const [inviting, setInviting] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members?.length ?? 0} member{members?.length === 1 ? "" : "s"} in
            your organization
          </p>
        </div>
        {isShowInviteButton && (
          <Button onClick={() => setInviting(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>
      <InviteDialog
        open={inviting}
        onClose={() => setInviting(false)}
        orgId={orgId}
      />
    </>
  );
}
