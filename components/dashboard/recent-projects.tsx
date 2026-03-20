"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS_CONFIG } from "@/lib/utils";
import type { Project } from "@/types";
import { ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { use } from "react";

function ProjectRow({ project }: Readonly<{ project: Project }>) {
  const config = PROJECT_STATUS_CONFIG[project.status];
  const total = project._count?.tasks ?? 0;
  // Fake completion % for demo
  // eslint-disable-next-line react-hooks/purity
  const progress = total > 0 ? Math.floor(Math.random() * 80 + 10) : 0;
  const params = useParams();

  return (
    <Link
      href={`${params.organization}/projects/${project.id}`}
      className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: project.color + "20" }}
      >
        <FolderKanban className="h-4 w-4" style={{ color: project.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {project.name}
          </p>
          <Badge variant={config.variant} className="ml-2 shrink-0 text-[11px]">
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">
            {progress}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {total} task{total !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}

export function RecentProjects({
  projects,
}: Readonly<{ projects: Promise<Project[]> }>) {
  const projectlist = use(projects);
  const recent = projectlist?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Recent Projects</CardTitle>
          <CardDescription>Your latest active projects</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="projects">
            View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <Button variant="link" size="sm" asChild className="mt-1">
              <Link href="projects">Create your first project →</Link>
            </Button>
          </div>
        ) : (
          recent.map((p) => <ProjectRow key={p.id} project={p} />)
        )}
      </CardContent>
    </Card>
  );
}
