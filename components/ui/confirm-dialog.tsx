"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransition } from "react";

export type ConfirmDialogType = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

const typeConfig = {
  danger: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    buttonVariant: "destructive" as const,
    defaultConfirmText: "Remove",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-amber-500",
    buttonVariant: "default" as const,
    defaultConfirmText: "Continue",
  },
  info: {
    icon: CheckCircle2,
    iconColor: "text-blue-500",
    buttonVariant: "default" as const,
    defaultConfirmText: "Confirm",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    buttonVariant: "default" as const,
    defaultConfirmText: "Done",
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  children,
  confirmText,
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  const [isTransitioning, startTransition] = useTransition();
  const config = typeConfig[type];
  const IconComponent = config.icon;
  const isDisabled = isLoading || isTransitioning || isPending;
  const finalConfirmText = confirmText || config.defaultConfirmText;

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {description && <DialogDescription className="mt-2">{description}</DialogDescription>}

        {children && <div className="my-4">{children}</div>}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isDisabled} className="sm:order-1">
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isDisabled}
            className="sm:order-2"
          >
            {isTransitioning || isLoading || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              finalConfirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
