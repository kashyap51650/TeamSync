/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Users, Crown, Shield, User } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TeamMember } from "@/types";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-amber-500" },
  MANAGER: { label: "Manager", icon: Shield, color: "text-blue-500" },
  MEMBER: { label: "Member", icon: User, color: "text-muted-foreground" },
};

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).default("MEMBER"),
});

type InviteForm = z.infer<typeof inviteSchema>;

function InviteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: InviteForm) => apiClient.post("/api/team", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "MEMBER" },
  });

  const onSubmit = (data: InviteForm) => mutate(data);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              {(error as Error).message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              defaultValue="MEMBER"
              onValueChange={(v) => setValue("role", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <div className="flex items-center gap-2">
                      <v.icon className={`h-3.5 w-3.5 ${v.color}`} />
                      {v.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const roleConfig = ROLE_CONFIG[member.role];

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(member.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{member.user.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {member.user.email}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <roleConfig.icon className={`h-3 w-3 ${roleConfig.color}`} />
            {roleConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Joined {formatDate(member.joinedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const [inviting, setInviting] = useState(false);
  const { data: members, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: () =>
      apiClient
        .get<{ data: TeamMember[] }>("/api/team")
        .then((r) => r.data ?? []),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members?.length ?? 0} member{members?.length !== 1 ? "s" : ""} in
            your organization
          </p>
        </div>
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      ) : members?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold">No team members yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite colleagues to collaborate
          </p>
          <Button className="mt-4" onClick={() => setInviting(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {members?.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}
