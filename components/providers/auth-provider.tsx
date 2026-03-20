"use client";
import { refreshAction } from "@/actions/auth";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Skip refresh on auth pages
    if (pathname === "/login" || pathname === "/register") {
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      setLoading(true);
      try {
        const result = await refreshAction();
        if (result) {
          setAuth(result.user, result.accessToken);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    };

    bootstrap();

    // Refresh access token every 12 minutes
    const interval = setInterval(
      async () => {
        try {
          const result = await refreshAction();
          if (result) {
            setAuth(result.user, result.accessToken);
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      },
      12 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [setAuth, clearAuth, setLoading, pathname]);

  return <>{children}</>;
}
