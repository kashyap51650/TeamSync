import { ProjectHeader } from "@/components/projects/project-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-2">
      <ProjectHeader projectLength={0} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {new Array(6).fill(0).map((_, i) => (
          <Skeleton key={i / 10} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
