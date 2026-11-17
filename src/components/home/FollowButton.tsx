"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function FollowButton({
  action,
  following,
  loggedIn,
}: {
  action: () => Promise<unknown>;
  following: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setOptimistic] = useOptimistic(following, (_s, next: boolean) => next);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!loggedIn) return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    startTransition(async () => {
      setOptimistic(!state);
      try {
        await action();
      } catch {
        /* volta ao valor do servidor */
      }
    });
  }

  return (
    <button
      type="button"
      aria-pressed={state}
      disabled={pending}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-[11px] font-bold tracking-label ${
        state ? "bg-primary/20 text-primary" : "bg-surface hover:bg-surface-high"
      }`}
    >
      {state ? "Seguindo" : "Seguir"}
    </button>
  );
}
