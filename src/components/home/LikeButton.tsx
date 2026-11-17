"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";

/** Curtir com atualização otimista. `action` é uma Server Action já "bindada". */
export default function LikeButton({
  action,
  count,
  liked,
  loggedIn,
}: {
  action: () => Promise<{ liked: boolean }>;
  count: number;
  liked: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setOptimistic] = useOptimistic(
    { liked, count },
    (s, next: boolean) => ({ liked: next, count: Math.max(0, s.count + (next ? 1 : -1)) }),
  );
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!loggedIn) return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    startTransition(async () => {
      setOptimistic(!state.liked);
      try {
        await action();
      } catch {
        /* o estado volta ao valor do servidor ao fim da transição */
      }
    });
  }

  return (
    <button
      type="button"
      aria-pressed={state.liked}
      disabled={pending}
      onClick={onClick}
      className={`flex items-center gap-1 transition-colors hover:text-ink ${state.liked ? "text-danger" : ""}`}
    >
      <Heart aria-hidden className={`size-3 ${state.liked ? "fill-current" : ""}`} />
      {state.count.toLocaleString("pt-BR")} {state.count === 1 ? "curtida" : "curtidas"}
    </button>
  );
}
