"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import StarInput from "@/components/StarInput";
import { saveEntry } from "@/app/(site)/obras/actions";
import { toFormData } from "@/lib/validators";

type AspectKey = "art" | "sound" | "story";
type Aspects = Record<AspectKey, number | null>;

const ASPECT_LABELS: Record<AspectKey, string> = {
  art: "Arte & Animação",
  sound: "Trilha Sonora",
  story: "Roteiro & Emoção",
};

/** "Sua Avaliação": nota geral + (opcional) notas por aspecto que alimentam as barras. */
export default function HeroRating({
  mediaId,
  loggedIn,
  rating,
  aspects,
}: {
  mediaId: string;
  loggedIn: boolean;
  rating: number | null;
  aspects: Aspects;
}) {
  const router = useRouter();
  const [value, setValue] = useState(rating);
  const [asp, setAsp] = useState(aspects);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const login = () => router.push("/login?next=/");

  function save(fields: Record<string, string>, rollback: () => void) {
    startTransition(async () => {
      try {
        await saveEntry(mediaId, toFormData(fields));
      } catch {
        rollback();
      }
    });
  }

  function rate(stars: number) {
    if (!loggedIn) return login();
    const prev = value;
    setValue(stars);
    save({ rating: String(stars * 2) }, () => setValue(prev));
  }

  function rateAspect(key: AspectKey, stars: number) {
    if (!loggedIn) return login();
    const prev = asp;
    setAsp({ ...asp, [key]: stars });
    save({ [`aspect_${key}`]: String(stars * 2) }, () => setAsp(prev));
  }

  return (
    <div className="space-y-2 rounded-lg bg-surface-low px-4 pb-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-label text-ink-muted">Sua Avaliação:</span>
        <StarInput value={value} onChange={rate} disabled={pending} />
      </div>

      {loggedIn && (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-[11px] font-bold tracking-label text-primary hover:underline"
          >
            Detalhar por aspecto
            <ChevronDown aria-hidden className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <ul className="space-y-1.5 pb-1">
              {(Object.keys(ASPECT_LABELS) as AspectKey[]).map((key) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-muted">{ASPECT_LABELS[key]}</span>
                  <StarInput
                    value={asp[key]}
                    onChange={(s) => rateAspect(key, s)}
                    disabled={pending}
                    size="size-3.5"
                    gap="gap-1"
                    label={ASPECT_LABELS[key]}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
