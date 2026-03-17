"use client";

import { createOrganizationAction } from "@/actions/organization";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

export function CreateOrganizationDialog({
  open,
  onClose,
}: Readonly<{
  open: boolean;
  onClose: () => void;
}>) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "", logoUrl: "" },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 60);
    setValue("slug", generatedSlug);
  };

  const onSubmit = (data: CreateOrgForm) => {
    startTransition(async () => {
      try {
        const org = await createOrganizationAction({
          name: data.name,
          slug: data.slug,
          logoUrl: data.logoUrl || undefined,
        });
        toast.success(`Organization "${org.name}" created`);
        reset();
        onClose();
        router.push(`/${org.slug}`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create organization",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Inc."
              {...register("name")}
              onChange={handleNameChange}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="org-slug">Slug</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground select-none">
                /
              </span>
              <Input
                id="org-slug"
                placeholder="acme-inc"
                {...register("slug")}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              URL-friendly identifier — lowercase letters, numbers and hyphens.
            </p>
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <Label htmlFor="org-logo">
              Logo URL{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="org-logo"
              placeholder="https://example.com/logo.png"
              {...register("logoUrl")}
            />
            {errors.logoUrl && (
              <p className="text-xs text-destructive">
                {errors.logoUrl.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
