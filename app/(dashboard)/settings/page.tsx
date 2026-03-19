import {
  AppearanceSettings,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/components/settings";
import { getAuthUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getAuthUser();

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <ProfileSettings user={user} />
      <AppearanceSettings />
      <NotificationSettings />
      <SecuritySettings />
    </div>
  );
}
