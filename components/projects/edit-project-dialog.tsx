import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";

// Icons
import { useProject } from "@/hooks/use-project";
import { PROJECT_STATUS_CONFIG, formatDate } from "@/lib/utils";
import { EditProjectForm, editProjectSchema } from "@/schema/project-schema";
import { useTransition } from "react";
import { updateProjectAction } from "@/actions/project";
import { toast } from "sonner";
import { ProjectStatus } from "@/types";
import { PROJECT_COLORS } from "@/lib/constant";

export function EditProjectDialog({
  open,
  onClose,
  project,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  project: NonNullable<ReturnType<typeof useProject>["data"]>;
}>) {
  const [isPending, setTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProjectForm>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      color: project.color,
      startDate: project.startDate
        ? formatDate(project.startDate, "yyyy-MM-dd")
        : "",
      endDate: project.endDate ? formatDate(project.endDate, "yyyy-MM-dd") : "",
    },
  });

  const selectedColor = watch("color");

  const onSubmit = (data: EditProjectForm) => {
    setTransition(async () => {
      try {
        await updateProjectAction(project.id, data);
        onClose();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "An error occurred while updating the project.",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={project.status}
                onValueChange={(v: ProjectStatus) => setValue("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      outline: selectedColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
