import Image from "next/image";
import { initialsOf } from "@/lib/format";

const PALETTE = [
  "bg-primary-strong text-primary-on",
  "bg-secondary-strong text-secondary-on",
  "bg-tertiary text-tertiary-on",
  "bg-danger-container text-danger-on",
  "bg-surface-bright text-ink",
];

// Cor estável por usuário (mesmo nome → mesma cor).
const colorFor = (name: string) =>
  PALETTE[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length];

export default function Avatar({
  name,
  url,
  className = "size-7 text-[11px]",
}: {
  name: string;
  url?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold tracking-label ${colorFor(name)} ${className}`}
    >
      {url ? <Image src={url} alt="" fill sizes="40px" className="object-cover" /> : initialsOf(name)}
    </span>
  );
}
