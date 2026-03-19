/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { updateProfileAction } from "@/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: any;
}

export function ProfileSettings({ user }: Readonly<ProfileSettingsProps>) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success("Profile updated successfully");
      }
      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {user ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Change avatar
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email}
              disabled
            />
          </div>
        </div>

        <Button size="sm" onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
