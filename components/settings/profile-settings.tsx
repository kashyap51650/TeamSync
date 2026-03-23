"use client";

import { updateProfileAction, uploadAvatarAction } from "@/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageUploadDialog } from "@/components/ui/image-upload-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";
import { User } from "@/types";
import { use, useState, useTransition } from "react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  userPromise: Promise<User>;
}

export function ProfileSettings({ userPromise }: Readonly<ProfileSettingsProps>) {
  const user = use(userPromise);

  const [isPending, startTransition] = useTransition();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isValueChange, setValueChange] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setValueChange(value !== user?.name);

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={formData.avatarUrl || undefined} />
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {user ? getInitials(user.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(true)}>
          Change avatar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={formData.name} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user?.email} disabled />
        </div>
      </div>

      <Button size="sm" onClick={handleSaveChanges} disabled={isPending || !isValueChange}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>

      <ImageUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title="Upload avatar"
        description="Choose a profile image to upload."
        onUpload={async (file) => {
          const payload = new FormData();
          payload.append("file", file);
          return uploadAvatarAction(payload);
        }}
        onUploaded={(url) => {
          setValueChange(true);
          setFormData((prev) => ({
            ...prev,
            avatarUrl: url,
          }));
        }}
      />
    </>
  );
}
