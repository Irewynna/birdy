import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// Call this at the top of any API route that creates/updates/deletes data.
// Returns { session } if signed in, or { errorResponse } if not — the route
// should immediately `return errorResponse` in that case.
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Sign in required to edit the catalogue." },
        { status: 401 }
      ),
    };
  }
  return { session, errorResponse: null };
}
