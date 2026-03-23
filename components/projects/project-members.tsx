import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMembersByProject } from "@/services/projects";
import { ProjectMemberRow } from "./project-member-row";

export const ProjectMemberCard = async ({ projectId }: { projectId: string }) => {
  const members = await fetchMembersByProject(projectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project Members</CardTitle>
        <CardDescription>Team members with access to this project</CardDescription>
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
              <ProjectMemberRow
                key={member.id}
                member={member}
                projectId={projectId}
                taskCount={taskCount}
                doneCount={doneCount}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
