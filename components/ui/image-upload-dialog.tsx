"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
  onUpload: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  title?: string;
  description?: string;
  maxSizeInMb?: number;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onUploaded,
  onUpload,
  title = "Upload image",
  description = "Select an image and upload it.",
  maxSizeInMb = 5,
}: Readonly<ImageUploadDialogProps>) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isUploading) return;
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxBytes = maxSizeInMb * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      toast.error(`File is too large. Maximum size is ${maxSizeInMb}MB.`);
      event.target.value = "";
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    setIsUploading(true);

    try {
      const result = await onUpload(file);

      if (!result.success || !result.url) {
        throw new Error(result.error || "Upload failed");
      }

      onUploaded(result.url);
      toast.success("Image uploaded successfully");
      handleClose(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="image-upload-input">Image</Label>
            <Input
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Selected preview"
              className="h-40 w-40 rounded-md border object-cover"
              width={40}
              height={40}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
