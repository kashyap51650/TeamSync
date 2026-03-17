import { Skeleton } from "@/components/ui/skeleton";
import { KANBAN_COLUMNS } from "@/lib/constant";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-3">
        {KANBAN_COLUMNS.map((s) => (
          <div key={s} className="min-w-[260px] space-y-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
