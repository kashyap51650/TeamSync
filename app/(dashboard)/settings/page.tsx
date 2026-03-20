import {
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/components/settings";
import {
  AppearanceIcon,
  AppearanceToggleRow,
} from "@/components/settings/appearance-settings";
import { SettingsCard } from "@/components/ui/settings-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUser } from "@/lib/auth";
import { fetchUserDetails } from "@/services/user";
import { Shield } from "lucide-react";
import { Suspense } from "react";

export default async function SettingsPage() {
  const user = await getAuthUser();
  const userPromise = fetchUserDetails(user?.sub);

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <SettingsCard
        title="Profile"
        description="Update your personal information"
      >
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <ProfileSettings userPromise={userPromise} />
        </Suspense>
      </SettingsCard>
      <SettingsCard
        title="Appearance"
        description="Customize how TeamSync looks for you"
        icon={<AppearanceIcon />}
      >
        <AppearanceToggleRow />
      </SettingsCard>
      <NotificationSettings />
      <SettingsCard title="Security" icon={<Shield className="h-4 w-4" />}>
        <SecuritySettings />
      </SettingsCard>
    </div>
  );
}
