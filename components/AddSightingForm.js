"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import MultiPhotoPicker from "@/components/MultiPhotoPicker";

export default function AddSightingForm({ speciesId }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [open, setOpen] = useState(false);
  const [dateSpotted, setDateSpotted] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  if (sessionStatus !== "loading" && !session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded-sm border border-hairline px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink/50 transition-colors hover:border-pine hover:text-pine"
      >
        Sign in to log a sighting
      </button>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (uploading) {
      setError("Still uploading — hang on a second.");
      return;
    }
    if (uploadedPhotos.length === 0) {
      setError("Add at least one photo for this sighting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/photos/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId,
          dateSpotted,
          location,
          notes,
          photos: uploadedPhotos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setDateSpotted("");
      setLocation("");
      setNotes("");
      setUploadedPhotos([]);
      setResetKey((k) => k + 1);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-sm border border-pine px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-pine transition-colors hover:bg-pine hover:text-paper"
      >
        + Log another sighting
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="specimen-card flex flex-col gap-5 p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink">New sighting</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-xs uppercase tracking-wide text-ink/40 hover:text-stamp"
        >
          Cancel
        </button>
      </div>

      <p className="-mt-3 font-mono text-[11px] text-ink/40">
        Select multiple photos if you have more than one — the date, location, and
        notes below will apply to all of them.
      </p>

      <MultiPhotoPicker
        key={resetKey}
        onUploadedChange={setUploadedPhotos}
        onBusyChange={setUploading}
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

      {error && <p className="font-mono text-xs text-stamp">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-sm border border-pine bg-pine px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Saving…" : uploading ? "Waiting for uploads…" : "Save sighting"}
      </button>
    </form>
  );
}
