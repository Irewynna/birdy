import Link from "next/link";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SpeciesCard from "@/components/SpeciesCard";
import SearchBar from "@/components/SearchBar";
import AuthButton from "@/components/AuthButton";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const session = await getServerSession(authOptions);

  const species = await prisma.species.findMany({
    where: q
      ? {
          OR: [
            { commonName: { contains: q, mode: "insensitive" } },
            { scientificName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { commonName: "asc" },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const totalCount = await prisma.species.count();
  const counts = await prisma.photo.groupBy({
    by: ["speciesId"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.speciesId, c._count._all])
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-8 flex flex-col gap-4 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
            Field Records · Est. {new Date().getFullYear()}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            The Bird Catalogue
          </h1>
          <p className="mt-2 max-w-lg font-body text-sm text-ink/60">
            A running index of every species spotted, with every photo filed
            under its specimen entry.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <AuthButton />
          {session ? (
            <Link
              href="/species/new"
              className="whitespace-nowrap rounded-sm border border-pine bg-pine px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:bg-ink"
            >
              + New specimen
            </Link>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink/30">
              Sign in to add specimens
            </p>
          )}
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
          {q
            ? `${species.length} of ${totalCount} specimens match "${q}"`
            : `Specimens on file: ${totalCount}`}
        </p>
        <Suspense fallback={<div className="h-10 w-64" />}>
          <SearchBar />
        </Suspense>
      </div>

      {totalCount === 0 ? (
        <div className="specimen-card flex flex-col items-center gap-3 px-8 py-20 text-center">
          <p className="font-display text-2xl text-ink">
            The drawer is empty.
          </p>
          <p className="max-w-sm font-body text-sm text-ink/60">
            Log your first bird to start the catalogue — a name, a photo, and
            wherever you spotted it is all you need.
          </p>
          {session ? (
            <Link
              href="/species/new"
              className="mt-2 rounded-sm border border-pine px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-pine transition-colors hover:bg-pine hover:text-paper"
            >
              Add first specimen
            </Link>
          ) : (
            <p className="mt-2 font-mono text-xs uppercase tracking-wide text-ink/30">
              Sign in above to add the first specimen
            </p>
          )}
        </div>
      ) : species.length === 0 ? (
        <div className="specimen-card flex flex-col items-center gap-3 px-8 py-16 text-center">
          <p className="font-display text-xl text-ink">
            No specimens match &ldquo;{q}&rdquo;.
          </p>
          <p className="max-w-sm font-body text-sm text-ink/60">
            Try a different spelling, or check the scientific name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {species.map((s) => (
            <SpeciesCard
              key={s.id}
              species={s}
              photoCount={countMap[s.id] ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
