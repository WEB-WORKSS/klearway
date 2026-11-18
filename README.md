# Klearway

Shipment document checks and status updates for freight forwarders and clearing agents.
Website: https://www.klearway.site · Contact: ogunlakin@klearway.site

This repository contains:

- **Marketing website**: Vite + React + Tailwind. It is prerendered to static HTML so search engines can read it, and covers Home, Privacy Policy, Terms of Service and 404.
- **MVP workspace** (`/app`): a working app for the core workflow. You create a shipment, upload its documents, the server extracts fields, a person confirms them, the server cross-checks the documents, and every result is saved and can be reopened later. Milestones and importer status updates are in the workspace too.
- **API** (`backend/`): Node.js + Express. It handles uploads, text extraction, the check engine, persistence, the lead form, and serves the built site.
- **Docs** (`docs/`): LinkedIn kit, brand assets, API reference, MVP test evidence, implementation status, AWS Activate answers and the deployment checklist.

> **Status: MVP locally functional. Not deployed.** See [docs/implementation-status.md](docs/implementation-status.md).

---

## Quick start

Requirements: Node.js 20 or newer, npm 10.

```bash
npm install
cp .env.example .env          # optional for local use
npm run dev                   # API on :8787 + Vite on :5173 (proxying /api)
```

Open http://localhost:5173 for the website and http://localhost:5173/app for the workspace. In the workspace, click **Load sample shipment** to run the full flow with fictional documents.

### Production build and run

```bash
npm run build                 # client build + SSR build + static prerender into dist/
npm start                     # serves dist/ and the API on PORT (default 8787)
```

### Tests

```bash
npm test                      # end-to-end API tests (node:test), using a temporary data directory
```

### Utility scripts

| Command | What it does |
|---|---|
| `npm run samples` | Regenerates the fictional sample PDFs in `public/samples/` |
| `npm run assets` | Re-renders the logo, favicon PNGs, Open Graph image and LinkedIn logo and banner (`docs/brand/`, `public/`) |

---

## Environment variables

All configuration is server-side. **No secret is ever placed in a `VITE_` variable or in frontend code.**

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no | API/server port (default 8787) |
| `PUBLIC_ORIGIN` | no | Public origin, e.g. `https://www.klearway.site` |
| `DATA_DIR` | no | Where `db.json` and `uploads/` are stored (default `backend/data`). Use a persistent volume in production. |
| `WORKSPACE_ACCESS_KEY` | **yes for any shared deployment** | Pilot access key. Every `/api/workspace` request must send it in `x-workspace-key`. If empty, the workspace API is open, which is acceptable only on your own machine. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | no | Lead notification email. If unset, leads are stored only, and the API reports `notified:false`. |
| `LEAD_NOTIFY_TO`, `LEAD_FROM` | with SMTP | Recipient and sender for notifications |
| `AI_PROVIDER` | no | Set to `bedrock` to enable Amazon Bedrock extraction. **Untested; see below.** |
| `AWS_REGION`, `BEDROCK_MODEL_ID` | with Bedrock | Region and model ID. Credentials come from the standard AWS credential chain. |

---

## How the MVP works

```
Upload (multer, 10 MB, PDF/TXT/CSV/JPG/PNG/WebP)
  → stored on disk under a random name (DATA_DIR/uploads)
  → text layer read (pdf.js for PDFs, UTF-8 for text; images have no text yet)
  → document type detected (bill of lading / commercial invoice / packing list / other)
  → label-based field extraction with the source line kept as a snippet
  → person reviews fields beside the stored file, edits and confirms them
  → check engine (backend/lib/checks.js):
       required documents present · required fields present · unconfirmed fields
       consignee across B/L, invoice, packing list (normalises Ltd/Limited etc.)
       package count B/L vs packing list · gross weight (0.5% tolerance)
       total quantity invoice vs packing list · invoice reference on packing list
       container set B/L vs packing list · ISO 6346 check digits · HS code format
  → check run saved with timestamp (last 20 kept per shipment)
  → milestones confirmed with date and note → importer update drafted from confirmed milestones
  → staff opens it in their own WhatsApp (wa.me link) or email (mailto); the update is logged as "prepared"
```

Everything is persisted in `DATA_DIR/db.json` with atomic writes, and is reloaded after a restart. The tests cover this.

### What is *not* implemented (honest list)

- **AI extraction:** `backend/lib/ai.js` holds a Bedrock Converse adapter, but it has **not been run against a live AWS account**. With `AI_PROVIDER` unset (the default), it is never called.
- **Scans and photos:** these are stored and previewed, but fields are entered by hand. Textract is in the proposed architecture only.
- **User accounts and roles:** a shared pilot access key protects the workspace, but there are no per-user logins yet.
- **Inbound WhatsApp and email, and automatic WhatsApp sending:** these are not implemented.
- **Deployment:** none has been done. No URL is live.

---

## Project structure

```
klearway/
├── backend/
│   ├── server.js            Express app: API + static site + SPA fallback for /app/*
│   ├── routes/              workspace.js (shipments, documents, checks, milestones, updates), leads.js
│   ├── lib/                 config, store (JSON persistence), extract (pdf.js + labels), checks,
│   │                        fields, milestones, validate, notify (SMTP), ai (Bedrock, untested)
│   └── data/                runtime data (git-ignored)
├── public/                  favicon, robots.txt, sitemap.xml, og-image.png, samples/*.pdf
├── scripts/                 prerender.js, generate-samples.js, render-assets.js
├── src/
│   ├── components/          layout/, sections/, workspace/, ui/, brand/
│   ├── pages/               Home, AppWorkspace, Privacy, Terms, NotFound, Legal
│   ├── data/                company.js (single business record), content.js (FAQ, sources)
│   ├── hooks/ lib/ styles/
│   ├── App.jsx  entry-client.jsx  entry-server.jsx
├── tests/api.test.js
├── docs/                    see below
├── Dockerfile  .env.example  index.html  vite.config.js  tailwind.config.js
```

`docs/`: `linkedin-profile.md`, `linkedin-banner.md`, `brand/` (logo, banner and OG artwork), `brand-guide.md`, `api.md`, `mvptest.md`, `implementation-status.md`, `aws-activate.md`, `deployment-checklist.md`.

---

## Deployment

The MVP is a single Node.js service that needs a **persistent disk** for `DATA_DIR`. Two straightforward options:

1. **A container host with a persistent volume**, such as a small Amazon EC2 or Lightsail instance with attached storage. Hosts without a persistent disk are not suitable until storage moves to S3 and DynamoDB. Use the included `Dockerfile`:
   ```bash
   docker build -t klearway .
   docker run -p 8787:8787 -v klearway-data:/data -e DATA_DIR=/data -e WORKSPACE_ACCESS_KEY=... klearway
   ```
2. **A VM (EC2/Lightsail):** run `npm ci && npm run build && npm start` under a process manager (systemd or pm2), behind a TLS-terminating reverse proxy (Caddy or nginx) for `www.klearway.site`.

**Static-only hosting** (Amplify Hosting, S3 + CloudFront, Netlify) serves the marketing site, but then the forms and `/app` have no API. They will show honest "server not reachable" errors and never a fake success. If you host this way, proxy `/api/*` to the Node service.

SPA routing: the Node server already maps `/privacy`, `/terms` and `/app/*` to their prerendered files and returns `404.html` with status 404 for unknown paths. On a static host, add a rewrite from `/app/*` to `/app/index.html`.

The proposed production architecture (S3, KMS, Textract, Bedrock, Lambda, API Gateway, DynamoDB, Cognito, SES, Amplify Hosting) is described on the website and in [docs/aws-activate.md](docs/aws-activate.md). None of it is deployed yet.

## Security notes

- Uploaded files get random names, live outside any public folder, and are served only through the API, with `nosniff` and inline disposition.
- The access key is compared in constant time. The frontend keeps it in `sessionStorage` only.
- The lead endpoint has a honeypot field and an in-memory rate limit (5 per IP per 10 minutes). In production, use AWS WAF or the proxy for rate limiting too.
- Don't upload real confidential documents to a shared deployment until HTTPS, an access key, the hosting location and retention are confirmed with the pilot firm.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). The workspace uses the native `<dialog>` element (Safari 15.4 or newer) and `navigator.clipboard` (HTTPS or localhost only). PDF preview uses the browser's built-in PDF viewer; on iOS Safari use **Open** to view the file.
