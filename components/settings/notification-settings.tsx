/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { SettingsCard } from "@/components/ui/settings-card";
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
}: Readonly<NotificationSettingsProps>) {
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
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: message,
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
    <SettingsCard
      title="Notifications"
      description="Control which alerts you receive"
      icon={<Bell className="h-4 w-4" />}
    >
      {NOTIFICATION_SETTINGS.map(({ id, label, desc }) => (
        <div key={id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <Switch
            checked={settings[id] || false}
            onCheckedChange={(checked) => handleNotificationChange(id, checked)}
          />
        </div>
      ))}
    </SettingsCard>
  );
}
