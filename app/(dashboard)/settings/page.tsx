import {
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/components/settings";
import {
  AppearanceIcon,
  AppearanceToggleRow,
} from "@/components/settings/appearance-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUser } from "@/lib/auth";
import { fetchUserDetails } from "@/services/user";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <ProfileSettings userPromise={userPromise} />
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AppearanceIcon />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how TeamSync looks for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AppearanceToggleRow />
        </CardContent>
      </Card>
      <NotificationSettings />
      <SecuritySettings />
    </div>
  );
}
