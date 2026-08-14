# AIwithBishal Marketing Landing Page

A responsive Next.js landing page for `marketing.aiwithbishal.com`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository in Vercel using the default Next.js settings.
3. Add `marketing.aiwithbishal.com` in **Project Settings → Domains**.
4. Redeploy. The existing DNS configuration will serve the site over HTTPS.

## Consultation form

The consultation form is the native Flodesk HTML embed stored at `public/flodesk-embed.html`. Its original form action, field names, hidden inputs, tracking configuration, and scripts are preserved. No custom form backend is used.

After Flodesk reports a successful submission, the page displays Flodesk's success state briefly and then redirects to `/thanks`. Lead capture and email automation remain inside Flodesk.
