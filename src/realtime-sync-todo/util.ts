import { useEffect, useRef } from "react";

export type TodoPayload = {
  title: string;
  done: boolean;
};

export function isTodoPayload(obj: any): obj is TodoPayload {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    typeof obj.done === "boolean"
  );
}

export type Todo = {
  id: string;
} & TodoPayload;

export function useOnMount(fn: () => void) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fn();
    }
  }, [fn]);
}
