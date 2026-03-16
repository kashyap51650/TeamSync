import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { fetchMembersByProject } from "@/services/projects";

export const ProjectMemberCard = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const members = await fetchMembersByProject(projectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project Members</CardTitle>
        <CardDescription>
          Team members with access to this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found.</p>
        ) : (
          members.map((member) => {
            const taskCount = member.project.tasks.filter(
              (t) => t.assignedToId === member.userId,
            ).length;
            const doneCount = member.project.tasks.filter(
              (t) => t.assignedToId === member.userId && t.status === "DONE",
            ).length;
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{taskCount} tasks</p>
                  <p className="text-xs text-muted-foreground">
                    {doneCount} done
                  </p>
                </div>
                {/* <Badge variant="secondary" className="text-[10px] shrink-0">
                  {member.role}
                </Badge> */}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
