# GATR VEX Robotics

University of Florida GATR VEX team site. Public marketing pages plus a members area for designated club members.

## Stack

- Next.js (App Router) on **Vercel**
- Auth.js (`next-auth`) with **Google (Gmail) SSO**
- **Vercel Blob** for print-queue files in production

## Local development

```bash
npm ci
cp .env.example .env.local
# set AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
npm run dev
```

Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application). Add authorized redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

Local print queue data lives in `data/print-queue.json` and `public/uploads/prints/` when `BLOB_READ_WRITE_TOKEN` is unset.

## Deploy on Vercel

1. Import this repo in the [Vercel dashboard](https://vercel.com) (or `npx vercel`).
2. Set environment variables:
   - `AUTH_SECRET`
   - `AUTH_URL` (production URL, e.g. `https://your-app.vercel.app`)
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
   - `AUTH_MEMBER_EMAILS` (comma-separated Gmail addresses)
3. Create a **Blob** store on the Vercel project (Storage → Blob) so `BLOB_READ_WRITE_TOKEN` is available.
4. Add the production Google redirect URI:
   `https://your-app.vercel.app/api/auth/callback/google`
5. Deploy.

## Members area

- Top-right **Sign in** → **Continue with Google**
- Only Google accounts in `AUTH_MEMBER_EMAILS` (plus defaults in [`lib/members.ts`](lib/members.ts)) can access `/members`
- Sign out is on the members portal page

### Adding members

Add their Gmail to the `AUTH_MEMBER_EMAILS` env var in Vercel (comma-separated), then redeploy or wait for the next request to pick up the new value. No code change required.

## 3D print queue

Signed-in members can open **Print queue** from the portal (`/members/print-queue`) to submit parts (`.stl`, `.obj`, `.3mf`), update status, and preview models.
