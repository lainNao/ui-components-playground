import { useEffect, useRef } from "react";

export type TodoPayload = {
  title: string;
  done: boolean;
};

export function isTodoPayload(obj: unknown): obj is TodoPayload {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof (obj as Record<string, unknown>).title === "string" &&
    typeof (obj as Record<string, unknown>).done === "boolean"
  );
}

export type Todo = {
  id: string;
} & TodoPayload;

// プレゼンス関連の型定義
export type PresenceAction =
  | { type: "editing-title"; todoId: string }
  | { type: "adding-todo" }
  | { type: "idle" };

export type UserPresence = {
  userId: string;
  userName: string;
  action: PresenceAction;
  lastUpdated: number;
};

export function useOnMount(fn: () => void) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fn();
    }
  }, [fn]);
}
