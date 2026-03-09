"use client";
import { refreshApi } from "@/actions/auth";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const result = await refreshApi();
      if (result) {
        setAuth(result.user, result.accessToken);
      } else {
        clearAuth();
      }
    };

    bootstrap();

    // Refresh access token every 12 minutes
    const interval = setInterval(
      async () => {
        const result = await refreshApi();
        if (result) {
          setAuth(result.user, result.accessToken);
        } else {
          clearAuth();
        }
      },
      12 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
