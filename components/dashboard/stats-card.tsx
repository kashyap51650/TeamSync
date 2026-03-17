import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  color?: "blue" | "indigo" | "green" | "red" | "amber" | "purple";
  urgent?: boolean;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    icon: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/50",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    icon: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  color = "indigo",
  urgent,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md py-0",
        urgent && "border-red-200 dark:border-red-900/50",
      )}
    >
      {urgent && <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />}
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {trend.value >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    trend.value >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-2.5", colors.iconBg)}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
