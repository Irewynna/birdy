"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink/30">
        …
      </span>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wide text-ink/50">
        <span>{session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="text-stamp hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-sm border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/60 transition-colors hover:border-pine hover:text-pine"
    >
      Sign in to edit
    </button>
  );
}
