# The Bird Catalogue

A personal field catalogue for bird sightings. Each **species** is one
catalogue entry; each entry can hold **any number of photos**, and every
photo carries its own date, location, and notes — so multiple sightings of
the same species just pile up under one record.

Stack: **Next.js** (hosted on **Netlify**) · **Neon** (Postgres, via Prisma) ·
**Cloudinary** (photo storage) · **Google OAuth** (via NextAuth).

**Anyone with the link can view the catalogue. Only you can edit it** — you
sign in with Google, and only the email(s) you allow in `ALLOWED_EMAILS`
are permitted to sign in at all.

Also included: live search across common/scientific names, duplicate
detection when adding a new specimen (with a link to the existing entry
instead), and multi-photo upload when logging a sighting.

---

## 1. Get your three accounts set up

### Neon (database)
1. Create a free project at [neon.tech](https://neon.tech).
2. In the dashboard, go to **Connection Details** and copy the **pooled**
   connection string (it contains `-pooler` in the hostname). It looks like:
   `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`

### Cloudinary (photo storage)
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Your **cloud name** is shown on the dashboard homepage, top left.
3. Go to **Settings → Upload → Upload presets → Add upload preset**:
   - Set **Signing Mode** to **Unsigned**.
   - Name it something like `bird_catalogue_unsigned` (or leave the
     auto-generated name and use that).
   - Save.

   Photos upload straight from your browser to Cloudinary using this preset
   — no server code or secret keys involved, which keeps this simple. The
   preset can only *upload*, not delete or manage your account, so it's safe
   to expose in the frontend.

### Netlify (hosting)
Just have an account at [netlify.com](https://netlify.com) — you'll connect
your repo in step 4.

### Google OAuth (edit access)
1. Go to [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
   and create a project if you don't have one.
2. **Create Credentials → OAuth client ID**. If prompted, configure the
   consent screen first (External is fine; you don't need to publish it —
   just add your own email under "Test users").
3. Application type: **Web application**.
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://YOUR-SITE.netlify.app/api/auth/callback/google` (your real
     Netlify URL — you can come back and add this after step 4 once you
     know the URL)
5. Copy the **Client ID** and **Client secret**.
6. Generate a random session secret: `openssl rand -base64 32`.

You'll set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`,
`NEXTAUTH_URL`, and `ALLOWED_EMAILS` in the next step.

---

## 2. Run it locally

```bash
npm install
cp .env.example .env
# now edit .env with your real Neon + Cloudinary values
```

Push the schema to your Neon database (creates the `Species` and `Photo`
tables — no manual SQL needed):

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 3. Push this to GitHub

```bash
git init
git add .
git commit -m "Bird catalogue"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

---

## 4. Deploy on Netlify

1. **Add new site → Import an existing project**, pick your GitHub repo.
2. Netlify will detect Next.js and use the settings from `netlify.toml`
   already in this repo (build command `npm run build`, the
   `@netlify/plugin-nextjs` plugin handles the rest) — you shouldn't need to
   change anything.
3. Before the first deploy, go to **Site configuration → Environment
   variables** and add:
   - `DATABASE_URL` — your Neon pooled connection string
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` — your real Netlify URL, e.g. `https://your-site.netlify.app`
     (no trailing slash)
   - `ALLOWED_EMAILS` — your Google email; this is what actually restricts
     editing to you
4. Deploy once so you get your real Netlify URL, then go back to the
   [Google Cloud credentials page](https://console.cloud.google.com/apis/credentials)
   and add `https://your-site.netlify.app/api/auth/callback/google` to the
   authorized redirect URIs if you hadn't already.
5. Your catalogue is live. Viewing works for anyone with the link; the
   **Sign in to edit** button in the header is how you (and only you) get
   editing access. You can add a custom domain under **Domain management** —
   just remember to update `NEXTAUTH_URL` and the Google redirect URI to
   match if you do.

---

## How access control actually works

- **Viewing** every page and API `GET` route is public — no session check.
- **Editing** (creating/deleting species or photos) is blocked server-side
  in every mutating API route via `lib/authGuard.js`, which checks for a
  valid session. This is enforced on the server, not just hidden in the UI,
  so it can't be bypassed by calling the API directly.
- **Who can sign in at all** is controlled by `ALLOWED_EMAILS` in
  `lib/auth.js` — Google's sign-in itself succeeds for anyone, but NextAuth's
  `signIn` callback rejects any email not on that list before a session is
  created. Leave `ALLOWED_EMAILS` unset only for local testing; always set
  it before deploying.

## Duplicate prevention

When you type a common name on the "New specimen" form, it checks
(debounced, as you type) whether that name already exists and shows a link
to the existing entry instead of letting you create a duplicate. The server
also enforces this independently on submit (case-insensitive exact match),
so it can't be bypassed even by calling the API directly. This only catches
exact name matches — "Cardinal" vs "Northern Cardinal" would still create
two entries, so it's worth checking the search bar first if you're not sure
a species is already logged.

---

## Project structure

```
app/
  page.js                     → home page, grid of species + search
  species/new/page.js         → form to add a new species (+ first photo)
  species/[id]/page.js        → one species' full photo/sighting log
  api/species/route.js        → list + create species (auth required to POST)
  api/species/[id]/route.js   → get/delete one species (auth required to DELETE)
  api/species/lookup/route.js → duplicate-name check while typing
  api/photos/route.js         → add one photo/sighting (auth required)
  api/photos/batch/route.js   → add several photos at once (auth required)
  api/photos/[id]/route.js    → delete one photo (auth required)
  api/auth/[...nextauth]/route.js → Google OAuth handler
components/
  PhotoPicker.js               → single-photo upload (New specimen form)
  MultiPhotoPicker.js          → multi-photo upload (Add sighting form)
  AddSightingForm.js, SearchBar.js, AuthButton.js, DeleteButton.js, SpeciesCard.js
lib/
  prisma.js       → Prisma client
  cloudinary.js    → browser → Cloudinary upload helper
  auth.js          → NextAuth config + allowed-email restriction
  authGuard.js     → server-side session check used by mutating API routes
  utils.js         → catalogue numbering, date formatting, card color swatch
prisma/schema.prisma → Species + Photo tables
```

## Notes
- Deleting a species deletes all its photos from the database (cascade),
  but doesn't delete the image files from Cloudinary — Cloudinary's free
  tier has plenty of room, so this is left simple on purpose. If storage
  ever becomes a concern, Cloudinary cleanup can be added later.
- `npm run db:studio` opens Prisma Studio, a quick visual browser/editor for
  the database if you ever want to peek at the raw data.
