import GoogleProvider from "next-auth/providers/google";

// Comma-separated list of Google emails allowed to sign in, e.g.
// ALLOWED_EMAILS="you@gmail.com". Leave unset during local dev if you want
// any Google account to be able to sign in; set it before deploying so this
// catalogue can only ever be edited by you.
const allowedEmails = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Runs before a sign-in is allowed to complete. This is the actual
    // security boundary — not just hiding buttons in the UI.
    async signIn({ profile }) {
      if (!profile?.email) return false;
      if (allowedEmails.length === 0) return true;
      return allowedEmails.includes(profile.email.toLowerCase());
    },
  },
};
