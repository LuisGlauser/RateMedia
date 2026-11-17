"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Avaliação interativa em meias-estrelas (0,5 a 5). Cada estrela tem duas metades
 * clicáveis; o hover mostra uma prévia da nota.
 */
export default function StarInput({
  value,
  onChange,
  size = "size-[15px]",
  gap = "gap-1.5",
  disabled = false,
  label = "Sua avaliação",
}: {
  value: number | null;
  onChange: (stars: number) => void;
  size?: string;
  gap?: string;
  disabled?: boolean;
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <div role="group" aria-label={label} className={`flex ${gap}`} onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`relative inline-block ${size}`}>
          <Star aria-hidden className={`${size} text-ink-dim`} />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${clamp(shown - (star - 1), 0, 1) * 100}%` }}
          >
            <Star aria-hidden className={`${size} fill-tertiary text-tertiary`} />
          </span>
          {[0.5, 1].map((half) => {
            const v = star - 1 + half;
            return (
              <button
                key={half}
                type="button"
                disabled={disabled}
                aria-label={`${String(v).replace(".", ",")} estrelas`}
                className={`absolute inset-y-0 w-1/2 disabled:cursor-wait ${half === 0.5 ? "left-0" : "right-0"}`}
                onMouseEnter={() => setHover(v)}
                onFocus={() => setHover(v)}
                onBlur={() => setHover(null)}
                onClick={() => onChange(v)}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
