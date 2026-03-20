"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function useThemeState() {
  const { resolvedTheme, setTheme } = useTheme();

  const ready = resolvedTheme !== undefined;
  const isDark = resolvedTheme === "dark";
  const onChange = (checked: boolean) => setTheme(checked ? "dark" : "light");

  return { ready, isDark, onChange };
}

export function AppearanceIcon() {
  const { ready, isDark } = useThemeState();

  if (!ready) return <Sun className="h-4 w-4 opacity-0" aria-hidden="true" />;
  return isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
}

export function AppearanceToggleRow() {
  const { ready, isDark, onChange } = useThemeState();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Dark mode</p>
        <p className="text-xs text-muted-foreground">
          Switch between light and dark themes
        </p>
      </div>
      <Switch checked={isDark} onCheckedChange={onChange} disabled={!ready} />
    </div>
  );
}
