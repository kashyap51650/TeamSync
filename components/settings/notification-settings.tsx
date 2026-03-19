/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateNotificationSettingsAction } from "@/actions/settings";
import { useToast } from "@/hooks/use-toast";

interface NotificationSetting {
  id: string;
  label: string;
  desc: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "task_assigned",
    label: "Task assigned to me",
    desc: "Get notified when someone assigns you a task",
  },
  {
    id: "task_due_soon",
    label: "Task due soon",
    desc: "Reminders 24 hours before due date",
  },
  {
    id: "project_updates",
    label: "Project updates",
    desc: "Status changes on your projects",
  },
];

interface NotificationSettingsProps {
  initialSettings?: Record<string, boolean>;
}

export function NotificationSettings({
  initialSettings = {},
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    initialSettings || {
      task_assigned: true,
      task_due_soon: true,
      project_updates: true,
    },
  );
  const { toast } = useToast();

  const handleNotificationChange = async (id: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [id]: checked,
    }));

    try {
      const result = await updateNotificationSettingsAction({
        [id]: checked,
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "Notification settings updated",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update settings",
          variant: "destructive",
        });
        // Revert the change on error
        setSettings((prev) => ({
          ...prev,
          [id]: !checked,
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
      // Revert the change on error
      setSettings((prev) => ({
        ...prev,
        [id]: !checked,
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
        <CardDescription>Control which alerts you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {NOTIFICATION_SETTINGS.map(({ id, label, desc }) => (
          <div key={id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch
              checked={settings[id] || false}
              onCheckedChange={(checked) =>
                handleNotificationChange(id, checked)
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
