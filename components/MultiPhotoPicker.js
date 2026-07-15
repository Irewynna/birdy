"use client";

import { useRef, useState, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

let idCounter = 0;

// Lets the person select several photos in one go. Each one uploads to
// Cloudinary independently and reports back up via onUploadedChange with
// the current list of *successfully uploaded* results — the parent form
// should only allow submission once every selected photo is done.
export default function MultiPhotoPicker({ onUploadedChange, onBusyChange }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]); // { id, file, preview, status, result, error, progress }

  const notifyParent = useCallback(
    (list) => {
      const uploaded = list.filter((i) => i.status === "done").map((i) => i.result);
      onUploadedChange?.(uploaded);
      onBusyChange?.(list.some((i) => i.status === "uploading"));
    },
    [onUploadedChange, onBusyChange]
  );

  function updateItem(id, patch) {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
      notifyParent(next);
      return next;
    });
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => ({
      id: ++idCounter,
      file,
      preview: URL.createObjectURL(file),
      status: "uploading",
      result: null,
      error: null,
      progress: 0,
    }));

    setItems((prev) => {
      const next = [...prev, ...newItems];
      notifyParent(next);
      return next;
    });

    newItems.forEach((item) => {
      uploadToCloudinary(item.file, (progress) => updateItem(item.id, { progress }))
        .then((result) => updateItem(item.id, { status: "done", result, progress: null }))
        .catch((err) =>
          updateItem(item.id, {
            status: "error",
            error: err.message || "Upload failed.",
            progress: null,
          })
        );
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(id) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      notifyParent(next);
      return next;
    });
  }

  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
        Photos <span className="text-stamp">*</span>
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-hairline bg-paper/40 px-6 py-8 text-center transition-colors hover:border-pine">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Click to choose one or more photos
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </label>

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-sm border border-hairline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt="Selected"
                className={`h-28 w-full object-cover ${
                  item.status === "uploading" ? "opacity-60" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute right-1 top-1 rounded-sm bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-paper hover:bg-stamp"
              >
                ✕
              </button>

              {item.status === "uploading" && (
                <span className="absolute bottom-1 left-1 rounded-sm bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-paper">
                  {item.progress ?? 0}%
                </span>
              )}
              {item.status === "done" && (
                <span className="absolute bottom-1 left-1 rounded-sm bg-pine/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-paper">
                  ✓
                </span>
              )}
              {item.status === "error" && (
                <span
                  className="absolute bottom-1 left-1 right-1 truncate rounded-sm bg-stamp/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-paper"
                  title={item.error}
                >
                  Failed
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-ink/40">
          {items.filter((i) => i.status === "done").length} of {items.length} uploaded
        </p>
      )}
    </div>
  );
}
