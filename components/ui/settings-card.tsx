import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  icon,
  children,
  contentClassName,
  className,
}: Readonly<SettingsCardProps>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
