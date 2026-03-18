"use client";

import { addMemberToOrganizationAction } from "@/actions/organization";
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
import { handlePrismaError } from "@/lib/prisma-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { Crown, Shield, User } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-amber-500" },
  MANAGER: { label: "Manager", icon: Shield, color: "text-blue-500" },
  MEMBER: { label: "Member", icon: User, color: "text-muted-foreground" },
};

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});

type InviteForm = z.infer<typeof inviteSchema>;

export function InviteDialog({
  orgId,
  open,
  onClose,
}: Readonly<{
  orgId: string;
  open: boolean;
  onClose: () => void;
}>) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "MEMBER" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: InviteForm) => {
    startTransition(async () => {
      try {
        await addMemberToOrganizationAction({
          organizationId: orgId,
          email: data.email,
          role: data.role,
        });
        handleClose();
        toast.success("Member invited successfully");
      } catch (error) {
        const { message } = handlePrismaError(error);
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              defaultValue="MEMBER"
              onValueChange={(value) =>
                setValue("role", value as InviteForm["role"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <value.icon className={`h-3.5 w-3.5 ${value.color}`} />
                      {value.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
