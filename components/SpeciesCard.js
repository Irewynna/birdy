import Link from "next/link";
import Image from "next/image";
import { swatchFor, formatCatalogNumber } from "@/lib/utils";

export default function SpeciesCard({ species, photoCount }) {
  const cover = species.photos[0];
  const swatch = swatchFor(species.commonName);
  const count = photoCount ?? species.photos.length;

  return (
    <Link
      href={`/species/${species.id}`}
      className="specimen-card group flex flex-col overflow-hidden"
    >
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: swatch }}
        aria-hidden="true"
      />

      <div className="relative aspect-[4/3] w-full bg-[#E3DFCF]">
        {cover ? (
          <Image
            src={cover.url}
            alt={species.commonName}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-wide text-ink/40">
            No photo yet
          </div>
        )}

        <span className="stamp-rotate absolute right-2 top-2 rounded-sm border border-stamp/70 bg-paper/90 px-2 py-0.5 font-mono text-[10px] tracking-wide text-stamp">
          {formatCatalogNumber(species.catalogNumber)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-display text-xl leading-snug text-ink">
          {species.commonName}
        </h2>
        {species.scientificName && (
          <p className="font-sci text-sm text-ink/70">
            {species.scientificName}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 font-mono text-[11px] uppercase tracking-wide text-ink/50">
          <span>
            {count} {count === 1 ? "sighting" : "sightings"}
          </span>
          <span className="text-ink/30 group-hover:text-stamp transition-colors">
            view →
          </span>
        </div>
      </div>
    </Link>
  );
}
