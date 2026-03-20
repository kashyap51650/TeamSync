// src/app/(auth)/layout.tsx
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import { getAuthUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen dot-grid bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex h-14 items-center px-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">TeamSync</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
