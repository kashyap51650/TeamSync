"use client";
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { Organization } from "@/types";
import {
  BarChart3,
  Check,
  CheckSquare,
  ChevronRight,
  ChevronsUpDown,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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

  const router = useRouter();
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  const activeOrg =
    organizations.find((org) => pathname.includes(org.slug)) ??
    organizations[0];

  const slug = activeOrg?.slug ?? "";
  const base = `/${slug}`;

  const buildHref = (path: string) => (path ? `${base}/${path}` : base);

  const isActive = (path: string) => {
    const href = buildHref(path);
    if (!path) return pathname === base || pathname === `${base}/`;
    return pathname === href;
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

      {/* Organization Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-14 w-full items-center gap-2 border-b border-sidebar-border px-4 hover:bg-sidebar-accent transition-colors outline-none">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={activeOrg?.logoUrl ?? undefined} />
              <AvatarFallback className="text-[11px] bg-primary text-primary-foreground">
                {activeOrg ? getInitials(activeOrg.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-left font-semibold text-sidebar-foreground tracking-tight">
              {activeOrg?.name ?? "No Organization"}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onSelect={() => router.push(`/${org.slug}`)}
                className="gap-2 cursor-pointer"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={org.logoUrl ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {getInitials(org.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{org.name}</span>
                {org.slug === activeOrg?.slug && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setCreateOrgOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-muted-foreground/50">
              <Plus className="h-3 w-3" />
            </div>
            <span>Create organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
      />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="mb-1">
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Menu
          </p>
        </div>

        {NAV_ITEMS.map((item) => {
          const href = buildHref(item.path);
          const disabled = organizations.length === 0;
          const active = !disabled && isActive(item.path);

          const baseClasses = cn(
            "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
            active
              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              : disabled
                ? "text-sidebar-foreground/40 opacity-60"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          );

          const iconClasses = cn(
            "h-4 w-4 shrink-0 transition-colors",
            active
              ? "text-sidebar-primary-foreground"
              : disabled
                ? "text-sidebar-foreground/30"
                : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
          );

          const itemInner = (
            <>
              <item.icon className={iconClasses} />
              {item.label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
              )}
            </>
          );

          if (disabled) {
            return (
              <div
                key={href}
                role="link"
                aria-disabled="true"
                tabIndex={-1}
                className={baseClasses}
              >
                {itemInner}
              </div>
            );
          }

          return (
            <Link key={href} href={href} className={baseClasses}>
              {itemInner}
            </Link>
          );
        })}

        <div className="mb-1">
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Recent Projects
          </p>
        </div>

        {activeOrg?.projects.map((project) => {
          const active = pathname.includes(project.id);
          return (
            <Link
              key={project.id}
              href={`/${activeOrg.slug}/projects/${project.id}`}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <FolderKanban
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                )}
              />
              {project.name}
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
    </aside>
  );
}
