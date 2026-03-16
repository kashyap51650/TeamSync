"use client";

import { addProjectMembersAction } from "@/actions/project";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import type { TeamMemberDropdownItem } from "@/types";
import { Check, Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function AddMemberDialog({
  open,
  onClose,
  projectId,
  users,
  existingMemberIds,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  projectId: string;
  users: TeamMemberDropdownItem[];
  existingMemberIds?: string[];
}>) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) &&
      !existingMemberIds?.includes(u.id),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    setSearch("");
    setSelected(new Set());
    onClose();
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      try {
        await addProjectMembersAction(projectId, Array.from(selected));
        toast.success(
          `${selected.size} member${selected.size > 1 ? "s" : ""} added to project`,
        );
        handleClose();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add members",
        );
      }
    });
  };

  const selectedUsers = users.filter((u) => selected.has(u.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>

        {/* Selected chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/40 p-2">
            {selectedUsers.map((u) => (
              <Badge
                key={u.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <Avatar className="h-3.5 w-3.5">
                  <AvatarFallback className="text-[8px]">
                    {getInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{u.name}</span>
                <button
                  type="button"
                  onClick={() => toggle(u.id)}
                  className="ml-0.5 rounded-full hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* User list */}
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-1 pr-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {search
                  ? "No users match your search."
                  : "All org members are already in this project."}
              </p>
            ) : (
              filtered.map((u) => {
                const isSelected = selected.has(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggle(u.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted ${
                      isSelected ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm">{u.name}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || selected.size === 0}
          >
            {isPending
              ? "Adding..."
              : `Add ${selected.size > 0 ? `(${selected.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
