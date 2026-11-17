import { Star } from "lucide-react";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Estrelas somente leitura com preenchimento fracionário (4,3 → 4 cheias + 30%). */
export default function StarsFill({
  value,
  size = "size-5",
  gap = "gap-1",
}: {
  value: number;
  size?: string;
  gap?: string;
}) {
  const v = clamp(value, 0, 5);
  return (
    <span role="img" aria-label={`Nota ${v.toFixed(1)} de 5`} className={`inline-flex ${gap}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`relative inline-block ${size}`}>
          <Star aria-hidden className={`${size} fill-surface-highest text-surface-highest`} />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${clamp(v - i, 0, 1) * 100}%` }}
          >
            <Star aria-hidden className={`${size} fill-tertiary text-tertiary`} />
          </span>
        </span>
      ))}
    </span>
  );
}
