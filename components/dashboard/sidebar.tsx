// src/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { Organization } from "@/types";

const NAV_ITEMS = [
  { label: "Dashboard", path: "", icon: LayoutDashboard },
  { label: "Projects", path: "projects", icon: FolderKanban },
  { label: "Tasks", path: "tasks", icon: CheckSquare },
  { label: "Analytics", path: "analytics", icon: BarChart3 },
  { label: "Team", path: "team", icon: Users },
];

const BOTTOM_ITEMS = [
  { label: "Settings", path: "settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  organizations,
}: Readonly<{ organizations: Organization[] }>) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const slug = organizations[0]?.slug ?? "";
  const base = `/${slug}`;

  const buildHref = (path: string) => (path ? `${base}/${path}` : base);

  const isActive = (path: string) => {
    const href = buildHref(path);
    if (!path) return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      {organizations.length === 0 && (
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground tracking-tight">
            TeamSync
          </span>
          <Badge
            variant="secondary"
            className="ml-auto text-[10px] px-1.5 py-0"
          >
            Beta
          </Badge>
        </div>
      )}

      {/* Organtionzation */}

      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Avatar className="h-7 w-7">
            <AvatarImage src={organizations[0].logoUrl ?? undefined} />
            <AvatarFallback className="text-[11px] bg-primary text-primary-foreground">
              {getInitials(organizations[0].name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <span className="font-semibold text-sidebar-foreground tracking-tight">
          {organizations[0].name}
        </span>
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          Beta
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="mb-1">
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Menu
          </p>
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const href = buildHref(item.path);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                )}
              />
              {item.label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
              )}
            </Link>
          );
        })}

        <div className="mt-auto">
          <div className="mb-1 mt-4">
            <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
              Account
            </p>
          </div>
          {BOTTOM_ITEMS.map((item) => {
            const href = item.href ?? buildHref(item.path);
            const active = item.href
              ? pathname.startsWith(item.href)
              : isActive(item.path);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[11px] bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground leading-none">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/50 mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
