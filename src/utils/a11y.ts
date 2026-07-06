import type { KeyboardEvent } from "react";

/** Invoke `fn` on Enter/Space, matching native button activation. */
export const onActivate =
  (fn: () => void) =>
  (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
