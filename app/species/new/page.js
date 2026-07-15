"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PhotoPicker from "@/components/PhotoPicker";

export default function NewSpeciesPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [dateSpotted, setDateSpotted] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [photoStatus, setPhotoStatus] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateMatch, setDuplicateMatch] = useState(null);

  // Live duplicate check as the person types a common name, debounced.
  useEffect(() => {
    const name = commonName.trim();
    if (name.length < 3) {
      setDuplicateMatch(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/species/lookup?name=${encodeURIComponent(name)}`);
        const matches = await res.json();
        const exact = matches.find(
          (m) => m.commonName.toLowerCase() === name.toLowerCase()
        );
        setDuplicateMatch(exact || null);
      } catch {
        // non-critical — the server still enforces this on submit
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [commonName]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!commonName.trim()) {
      setError("Give this bird a name.");
      return;
    }
    if (duplicateMatch) {
      setError(`"${duplicateMatch.commonName}" is already in the catalogue — add this as a sighting there instead.`);
      return;
    }
    if (photoStatus === "uploading") {
      setError("Still uploading the photo — hang on a second.");
      return;
    }
    if (!uploaded) {
      setError("Add a photo before filing this specimen.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commonName,
          scientificName,
          photo: { ...uploaded, dateSpotted, location, notes },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.existingId) {
          setError(data.error);
          setDuplicateMatch({ id: data.existingId, commonName: commonName.trim() });
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }
      router.push(`/species/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wide text-ink/50 hover:text-stamp"
      >
        ← Back to catalogue
      </Link>

      <h1 className="mb-1 mt-4 font-display text-3xl text-ink">
        New specimen
      </h1>
      <p className="mb-8 font-body text-sm text-ink/60">
        File a new species with its first photo and sighting details.
      </p>

      {sessionStatus === "loading" ? (
        <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
          …
        </p>
      ) : !session ? (
        <div className="specimen-card flex flex-col items-start gap-3 p-6">
          <p className="font-body text-sm text-ink/70">
            Sign in with Google to add a specimen to the catalogue.
          </p>
          <Link
            href="/"
            className="rounded-sm border border-pine px-4 py-2 font-mono text-xs uppercase tracking-wide text-pine hover:bg-pine hover:text-paper"
          >
            Back to catalogue to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="specimen-card flex flex-col gap-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                Common name <span className="text-stamp">*</span>
              </label>
              <input
                type="text"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Northern Cardinal"
                className="w-full rounded-sm border border-hairline bg-paper/40 px-3 py-2 font-body text-sm text-ink outline-none focus:border-pine"
              />
              {duplicateMatch && (
                <p className="mt-1.5 font-mono text-[11px] text-stamp">
                  Already catalogued —{" "}
                  <Link
                    href={`/species/${duplicateMatch.id}`}
                    className="underline"
                  >
                    add a sighting there instead
                  </Link>
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                Scientific name
              </label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="Cardinalis cardinalis"
                className="w-full rounded-sm border border-hairline bg-paper/40 px-3 py-2 font-sci text-sm italic text-ink outline-none focus:border-pine"
              />
            </div>
          </div>

          <PhotoPicker
            required
            onUploaded={setUploaded}
            onClear={() => setUploaded(null)}
            onStatusChange={setPhotoStatus}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                Date spotted
              </label>
              <input
                type="date"
                value={dateSpotted}
                onChange={(e) => setDateSpotted(e.target.value)}
                className="w-full rounded-sm border border-hairline bg-paper/40 px-3 py-2 font-body text-sm text-ink outline-none focus:border-pine"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Backyard feeder"
                className="w-full rounded-sm border border-hairline bg-paper/40 px-3 py-2 font-body text-sm text-ink outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Behavior, field marks, anything worth remembering."
              className="w-full rounded-sm border border-hairline bg-paper/40 px-3 py-2 font-body text-sm text-ink outline-none focus:border-pine"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-stamp">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || photoStatus === "uploading" || !!duplicateMatch}
            className="rounded-sm border border-pine bg-pine px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Filing…"
              : photoStatus === "uploading"
              ? "Waiting for upload…"
              : "File specimen"}
          </button>
        </form>
      )}
    </main>
  );
}
