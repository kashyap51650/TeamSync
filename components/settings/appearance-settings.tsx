"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          Appearance
        </CardTitle>
        <CardDescription>Customize how TeamSync looks for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">
              Switch between light and dark themes
            </p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={handleThemeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
