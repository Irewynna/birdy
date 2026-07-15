import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatCatalogNumber, formatDate, swatchFor } from "@/lib/utils";
import AddSightingForm from "@/components/AddSightingForm";
import DeleteButton from "@/components/DeleteButton";
import AuthButton from "@/components/AuthButton";

export const dynamic = "force-dynamic";

export default async function SpeciesDetailPage({ params }) {
  const [species, session] = await Promise.all([
    prisma.species.findUnique({
      where: { id: params.id },
      include: { photos: { orderBy: { createdAt: "desc" } } },
    }),
    getServerSession(authOptions),
  ]);

  if (!species) notFound();

  const swatch = swatchFor(species.commonName);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wide text-ink/50 hover:text-stamp"
        >
          ← Back to catalogue
        </Link>
        <AuthButton />
      </div>

      <header className="mt-4 flex flex-col gap-3 border-b border-hairline pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="mt-2 h-10 w-1.5 rounded-full"
            style={{ backgroundColor: swatch }}
            aria-hidden="true"
          />
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-stamp">
              {formatCatalogNumber(species.catalogNumber)}
            </p>
            <h1 className="font-display text-4xl text-ink">
              {species.commonName}
            </h1>
            {species.scientificName && (
              <p className="mt-1 font-sci text-lg italic text-ink/70">
                {species.scientificName}
              </p>
            )}
          </div>
        </div>

        {session && (
          <DeleteButton
            url={`/api/species/${species.id}`}
            label="Delete specimen"
            confirmText="Delete this whole entry?"
            className="font-mono text-[11px] uppercase tracking-wide text-ink/40 hover:text-stamp"
            redirectTo="/"
          />
        )}
      </header>

      <section className="mt-8">
        <p className="mb-4 font-mono text-xs uppercase tracking-wide text-ink/40">
          {species.photos.length}{" "}
          {species.photos.length === 1 ? "sighting" : "sightings"} on file
        </p>

        <div className="flex flex-col gap-6">
          {species.photos.map((photo) => (
            <article
              key={photo.id}
              className="specimen-card flex flex-col gap-4 p-4 sm:flex-row"
            >
              <div className="relative h-56 w-full flex-shrink-0 overflow-hidden rounded-sm bg-[#E3DFCF] sm:h-40 sm:w-56">
                <Image
                  src={photo.url}
                  alt={species.commonName}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
                    {formatDate(photo.dateSpotted) || "Date not recorded"}
                  </p>
                  {session && (
                    <DeleteButton
                      url={`/api/photos/${photo.id}`}
                      label="Remove"
                      confirmText="Remove this photo?"
                      className="font-mono text-[10px] uppercase tracking-wide text-ink/30 hover:text-stamp"
                    />
                  )}
                </div>
                {photo.location && (
                  <p className="font-body text-sm font-medium text-ink">
                    📍 {photo.location}
                  </p>
                )}
                {photo.notes && (
                  <p className="font-body text-sm text-ink/70">
                    {photo.notes}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <AddSightingForm speciesId={species.id} />
      </section>
    </main>
  );
}
