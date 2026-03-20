"use client";

import type { ExternalToast } from "sonner";
import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "error" | "info";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ExternalToast["action"];
  duration?: number;
};

type ToastId = string | number;

type ToastMethodOptions = Omit<ToastInput, "title" | "description" | "variant">;

type ToastHandler = {
  (input: ToastInput): ToastId;
  success: (
    title: string,
    description?: string,
    options?: ToastMethodOptions,
  ) => ToastId;
  error: (
    title: string,
    description?: string,
    options?: ToastMethodOptions,
  ) => ToastId;
  info: (
    title: string,
    description?: string,
    options?: ToastMethodOptions,
  ) => ToastId;
};

function inferVariant(title?: string, variant?: ToastVariant): ToastVariant {
  if (variant) {
    return variant;
  }

  const normalizedTitle = title?.trim().toLowerCase();

  if (normalizedTitle === "success") {
    return "success";
  }

  if (normalizedTitle === "error") {
    return "error";
  }

  if (normalizedTitle === "info") {
    return "info";
  }

  return "default";
}

function showToast({
  title,
  description,
  variant,
  action,
  duration,
}: ToastInput) {
  const resolvedVariant = inferVariant(title, variant);
  const message = title ?? description ?? "Notification";
  const toastDescription = title && description ? description : undefined;
  const options: ExternalToast = {
    description: toastDescription,
    action,
    duration,
  };

  switch (resolvedVariant) {
    case "destructive":
    case "error":
      return sonnerToast.error(message, options);
    case "success":
      return sonnerToast.success(message, options);
    case "info":
      return sonnerToast.info(message, options);
    default:
      return sonnerToast(message, options);
  }
}

export const toast = Object.assign(showToast, {
  success: (
    title: string,
    description?: string,
    options?: ToastMethodOptions,
  ) => showToast({ title, description, variant: "success", ...options }),
  error: (title: string, description?: string, options?: ToastMethodOptions) =>
    showToast({ title, description, variant: "error", ...options }),
  info: (title: string, description?: string, options?: ToastMethodOptions) =>
    showToast({ title, description, variant: "info", ...options }),
}) as ToastHandler;

export function useToast() {
  return { toast };
}
