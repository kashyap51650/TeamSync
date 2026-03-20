"use client";

import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";

interface NoOrgWelcomeProps {
  userName?: string | null;
}

export function NoOrgWelcome({ userName }: Readonly<NoOrgWelcomeProps>) {
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FolderKanban className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome to TeamSync{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first organization to start managing projects, tasks,
            and your team.
          </p>
          <Button onClick={() => setCreateOrgOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Organization
          </Button>
        </div>
        <CreateOrganizationDialog
          open={createOrgOpen}
          onClose={() => setCreateOrgOpen(false)}
        />
      </div>
    </div>
  );
}
