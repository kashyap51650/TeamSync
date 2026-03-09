// src/hooks/use-sse.ts
"use client";
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { taskKeys } from "./use-tasks";
import { projectKeys } from "./use-project";

export function useSSE() {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleEvent = useCallback(
    (event: MessageEvent, type: string) => {
      try {
        const data = JSON.parse(event.data);

        switch (type) {
          case "task:created":
          case "task:updated":
          case "task:deleted":
          case "task:status_changed":
            qc.invalidateQueries({ queryKey: taskKeys.all });
            break;

          case "project:created":
          case "project:updated":
          case "project:deleted":
            qc.invalidateQueries({ queryKey: projectKeys.all });
            break;

          case "notification:new":
            // Could trigger a notification toast here
            break;
        }
      } catch {}
    },
    [qc],
  );

  useEffect(() => {
    if (!accessToken) return;

    const connect = () => {
      const url = `/api/events`;
      const es = new EventSource(url);

      es.addEventListener("connected", () => {
        console.log("[SSE] Connected");
      });

      const events = [
        "task:created",
        "task:updated",
        "task:deleted",
        "task:status_changed",
        "project:created",
        "project:updated",
        "project:deleted",
        "notification:new",
      ];

      events.forEach((type) => {
        es.addEventListener(type, (e: Event) =>
          handleEvent(e as MessageEvent, type),
        );
      });

      es.onerror = () => {
        es.close();
        // Reconnect after 5s
        setTimeout(connect, 5000);
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [accessToken, handleEvent]);
}
