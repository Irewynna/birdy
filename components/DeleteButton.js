"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  confirmText = "Delete this?",
  label = "Delete",
  redirectTo,
  className = "",
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide">
        <span className="text-ink/60">{confirmText}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="text-stamp hover:underline"
        >
          {busy ? "…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink/40 hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={className}
    >
      {label}
    </button>
  );
}
