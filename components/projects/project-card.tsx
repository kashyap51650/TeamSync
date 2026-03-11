import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS_CONFIG, formatDate } from "@/lib/utils";
import type { Project } from "@/types";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { ProjectCardAction } from "./project-card-action";

export function ProjectCard({ project }: Readonly<{ project: Project }>) {
  const config = PROJECT_STATUS_CONFIG[project.status];
  const total = project._count?.tasks ?? 0;
  const progress = total > 0 ? 45 : 0; // Would compute from actual data

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md gap-0">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: project.color }}
      />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: project.color + "20" }}
            >
              <FolderKanban
                className="h-4 w-4"
                style={{ color: project.color }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-sm">{project.name}</h3>
              <Badge
                variant={config.variant}
                className="mt-0.5 text-[10px] px-1.5 py-0"
              >
                {config.label}
              </Badge>
            </div>
          </div>
          <ProjectCardAction projectId={project.id} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{total} tasks</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Created {formatDate(project.createdAt)}</span>
          <Link
            href={`/projects/${project.id}`}
            className="text-primary hover:underline"
          >
            View →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
