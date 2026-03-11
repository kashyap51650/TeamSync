"use client";

import { useState, useCallback } from "react";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactElement;
};

let toastState: ToastType[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function toast(t: Omit<ToastType, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastState = [...toastState, { ...t, id }];
  notify();
  setTimeout(() => {
    toastState = toastState.filter((x) => x.id !== id);
    notify();
  }, 5000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>(toastState);

  const subscribe = useCallback(() => {
    const handler = () => setToasts([...toastState]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  useState(() => {
    return subscribe();
  });

  return { toasts, toast };
}
