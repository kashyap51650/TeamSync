import "server-only";

import { after } from "next/server";
import { getAuthUser } from "@/lib/auth";
import type { JWTPayload } from "@/types";

function logError(error: unknown, actionName: string) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as Record<string, unknown>)?.code;

  const entry: Record<string, unknown> = {
    timestamp,
    level: "error",
    action: actionName,
    message,
    ...(code ? { code } : {}),
  };

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    entry.stack = error.stack;
  }

  console.error(JSON.stringify(entry));
}

export function authenticatedAction<TArgs extends unknown[], TReturn>(
  fn: (user: JWTPayload, ...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const user = await getAuthUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    try {
      return await fn(user, ...args);
    } catch (error) {
      after(() => logError(error, fn.name || "authenticatedAction"));
      throw error;
    }
  };
}

export function action<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      after(() => logError(error, fn.name || "action"));
      throw error;
    }
  };
}
