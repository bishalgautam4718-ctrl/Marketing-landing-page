# AIwithBishal Marketing Landing Page

A responsive Next.js landing page for `marketing.aiwithbishal.com`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import that repository in Vercel; its default Next.js settings are correct.
3. In **Project Settings → Domains**, add `marketing.aiwithbishal.com`.
4. Redeploy. Your existing valid DNS configuration will serve the site over HTTPS.

## Consultation email delivery

The consultation form sends two server-side emails, then redirects the client to `/thank-you`:

- You receive their name, email, phone number, business, and consultation goals.
- They receive a branded confirmation explaining that you will contact them personally.

Copy `.env.example` to `.env.local` locally, then add the same values in **Vercel → Project Settings → Environment Variables**. For Gmail, set `SMTP_USER` to your Gmail address and generate a 16-character **App Password** for `SMTP_PASS` (do not use your normal Gmail password). `BUSINESS_EMAIL` is the inbox where you want enquiries delivered.

After adding the variables, submit one test consultation request from the deployed site and verify both inboxes receive an email.

The project automatically stores each consultation in the `Consultation Leads` tab. The tab includes a frozen branded header, filters, alternating row colors, fitted column widths, and a status dropdown. To prepare or refresh the layout manually, run `npm run setup:sheet`.
