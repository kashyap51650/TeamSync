"use client";

import type { TeamMember } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getInitials } from "@/lib/utils";
import { Crown, Shield, User } from "lucide-react";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-amber-500" },
  MANAGER: { label: "Manager", icon: Shield, color: "text-blue-500" },
  MEMBER: { label: "Member", icon: User, color: "text-muted-foreground" },
};

export function MemberCard({ member }: Readonly<{ member: TeamMember }>) {
  const roleConfig = ROLE_CONFIG[member.role];

  return (
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
          <p className="truncate text-xs text-muted-foreground">
            {member.user.email}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <roleConfig.icon className={`h-3 w-3 ${roleConfig.color}`} />
            {roleConfig.label}
          </Badge>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Joined {formatDate(member.joinedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
