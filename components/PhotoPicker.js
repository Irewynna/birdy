"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

// status: "idle" | "uploading" | "done" | "error"
export default function PhotoPicker({ onUploaded, onClear, onStatusChange, required }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  function setStatusAndNotify(next) {
    setStatus(next);
    onStatusChange?.(next);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setProgress(0);
    setStatusAndNotify("uploading");

    try {
      const result = await uploadToCloudinary(file, setProgress);
      setProgress(null);
      setStatusAndNotify("done");
      onUploaded?.(result);
    } catch (err) {
      setProgress(null);
      setError(err.message || "Upload failed.");
      setStatusAndNotify("error");
    }
  }

  function handleClear() {
    setPreview(null);
    setProgress(null);
    setError(null);
    setStatusAndNotify("idle");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
        Photo {required && <span className="text-stamp">*</span>}
      </label>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-hairline bg-paper/40 px-6 py-10 text-center transition-colors hover:border-pine">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Click to choose a photo
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-sm border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected preview"
            className={`max-h-64 w-full object-cover ${
              status === "uploading" ? "opacity-60" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-sm bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-paper hover:bg-stamp"
          >
            Remove
          </button>

          {status === "uploading" && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-sm bg-ink/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-paper">
                  Uploading… {progress ?? 0}%
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
                <div
                  className="h-full bg-pine transition-all"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
            </>
          )}

          {status === "done" && (
            <span className="absolute bottom-2 left-2 rounded-sm bg-pine/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-paper">
              ✓ Uploaded
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2">
          <p className="font-mono text-xs text-stamp">{error}</p>
          <button
            type="button"
            onClick={handleClear}
            className="font-mono text-xs uppercase text-ink/50 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
