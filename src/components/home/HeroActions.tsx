"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Heart, Info } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import Popover from "@/components/Popover";
import { USER_STATUSES, statusLabel } from "@/lib/constants";
import { toFormData } from "@/lib/validators";
import { saveEntry } from "@/app/(site)/obras/actions";
import type { MediaType, UserStatus } from "@/types";

const itemClass =
  "flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-xs font-semibold hover:bg-surface-highest";

/**
 * Botões do Spotlight: lista, status, detalhes e favorito.
 * "Adicionar à Lista" reaproveita o AddToListButton do projeto (modal com listas públicas/privadas).
 */
export default function HeroActions({
  mediaId,
  mediaTitle,
  mediaType,
  loggedIn,
  status: initialStatus,
  isFavorite,
}: {
  mediaId: string;
  mediaTitle: string;
  mediaType: MediaType;
  loggedIn: boolean;
  status: UserStatus | null;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [favorite, setFavorite] = useState(isFavorite);
  const [, startTransition] = useTransition();

  const login = () => router.push("/login?next=/");

  function saveField(fields: Record<string, string>, rollback: () => void) {
    startTransition(async () => {
      try {
        await saveEntry(mediaId, toFormData(fields));
      } catch {
        rollback();
      }
    });
  }

  function pickStatus(next: UserStatus, close: () => void) {
    const prev = status;
    setStatus(next);
    close();
    saveField({ status: next }, () => setStatus(prev));
  }

  function toggleFavorite() {
    if (!loggedIn) return login();
    const prev = favorite;
    setFavorite(!prev);
    saveField({ favorite: prev ? "0" : "1" }, () => setFavorite(prev));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <AddToListButton mediaId={mediaId} mediaTitle={mediaTitle} />

      <Popover
        trigger={({ open, toggle }) => (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={loggedIn ? toggle : login}
            className="inline-flex items-center gap-1 rounded bg-surface-high px-4 py-2 text-sm font-semibold hover:bg-surface-highest"
          >
            <span className="size-2 rounded-full bg-secondary shadow-[0_0_8px_#7bd0ff]" />
            {status ? statusLabel(status, mediaType) : "Definir Status"}
            <ChevronDown aria-hidden className="size-2.5" />
          </button>
        )}
      >
        {(close) => (
          <ul>
            {USER_STATUSES.map((s) => (
              <li key={s}>
                <button type="button" role="menuitemradio" aria-checked={status === s} onClick={() => pickStatus(s, close)} className={itemClass}>
                  {statusLabel(s, mediaType)}
                  {status === s && <Check aria-hidden className="size-3.5 text-secondary" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Popover>

      <Link
        href={`/obras/${mediaId}`}
        className="inline-flex items-center gap-1 rounded bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-high"
      >
        <Info aria-hidden className="size-4" />
        Ver Detalhes Completos
      </Link>

      <button
        type="button"
        aria-label={favorite ? "Remover dos favoritos" : "Favoritar obra"}
        aria-pressed={favorite}
        onClick={toggleFavorite}
        className="rounded bg-surface px-2 py-2 hover:bg-surface-high"
      >
        <Heart aria-hidden className={`size-4 ${favorite ? "fill-danger text-danger" : ""}`} />
      </button>
    </div>
  );
}
