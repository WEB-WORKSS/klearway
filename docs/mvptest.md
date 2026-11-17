# MVP test evidence

**Date:** 17 November 2026. **Environment:** Windows 11, Node.js 20.18.0, local production build (`npm run build && npm start`) on http://localhost:8787. **Status:** MVP locally functional. Nothing has been tested on a deployed URL, because none exists.

## 1. Automated end-to-end API tests: `npm test`

These are real HTTP requests to the Express app, using a temporary data directory and an access key.

```
ok 1 - ISO 6346 check digit (known example CSQU3054383)
ok 2 - Nigerian phone normalisation
ok 3 - workspace rejects requests without the access key
ok 4 - full document check flow persists and survives a restart
ok 5 - sample shipment endpoint runs the same pipeline and is labelled
ok 6 - lead form validates, rejects honeypot, stores valid leads
# tests 6  # pass 6  # fail 0
```

Test 4 covers the following:

1. A shipment with no reference is rejected (`422`). A valid one is created, and its phone number is normalised to `+2348031234567`.
2. Three PDFs are uploaded. Each document type is detected automatically, and the extracted values are checked: B/L packages `1200`, packing-list packages `1180`, invoice number `NHC-INV-2026-0412`, B/L gross weight `24180`.
3. An `.exe` upload is rejected (`415`).
4. A check run returns `Package count does not match` and `Total quantity does not match` (both mismatches), plus passes for consignee (Ltd versus Limited), container check digits and the invoice reference. It also returns at least 3 warnings for unconfirmed fields.
5. A person corrects the packing list (`1200`, `1728`), which records `source: manual`. The re-run shows **0 mismatches**.
6. A milestone without a date is rejected (`422`). With a date it is saved, and the drafted update contains "Arrived at port or terminal on 10 Nov 2026". The update is logged.
7. The stored PDF is downloaded with `content-type: application/pdf`.
8. **The server is restarted.** The shipment reloads from disk with 3 documents, 2 check runs, 1 update and the confirmed milestone, and the list shows stage "Arrived at port or terminal".

## 2. Manual API run against the production server (curl)

```
created 4df1c893-…
bill_of_lading extracted fields=11
commercial_invoice extracted fields=10
packing_list extracted fields=7
{"mismatch":2,"missing":0,"warning":3,"pass":6}
mismatch Package count does not match
mismatch Total quantity does not match
warning  11 fields not yet confirmed on B/L
warning  10 fields not yet confirmed on Invoice
warning  7 fields not yet confirmed on Packing list
pass     Consignee matches across documents
pass     Gross weight matches
pass     Packing list refers to this invoice
pass     Container numbers match
pass     Container check digits are valid
pass     HS code is in a valid format
no-file upload: 400
POST /api/leads {kind:contact, fullName:"x", email:"bad"} → 422 with field errors
delete: 204
GET /api/health → {"ok":true,"accessKeyRequired":false,"ai":{"enabled":false,…},"leadEmail":false}
```

## 3. Browser checks (built-in browser, production build)

| Check | Result |
|---|---|
| Home at 1440 px: hero, nav, all sections render | ✔ |
| Home at 375 px: hero and both CTAs above the fold, mobile menu opens and closes | ✔ |
| Demo tour: click a step, Next/Back, arrow keys between tabs | ✔ |
| `/app` → **Load sample shipment** → document review shows the stored PDF beside its fields | ✔ |
| **Run checks** shows 2 mismatches, 3 warnings and 6 passes, and check history appears | ✔ |
| Status: confirm "Documents checked" with a note | ✔ |
| Importer updates: draft includes the confirmed milestone and note; WhatsApp and Email buttons stay disabled until contact details exist | ✔ |
| Pilot form, empty submit: inline errors, focus moves to the first invalid field | ✔ |
| Pilot form, valid submit (with `?plan=growth`): success state, lead saved with plan "Growth" and normalised WhatsApp number; no claim that an email was sent | ✔ |
| Console errors on home and `/app` after the fix | none |
| `/privacy` and `/terms/` return 200, unknown paths return 404 with `404.html`, `/app/shipments/x` returns the SPA shell | ✔ |
| Prerendered HTML holds the full marketing copy (crawlable), one `<h1>` per page, and every in-page anchor resolves | ✔ |

## Not tested

- Lighthouse scores and throttled 3G load time (Lighthouse was not available in this environment). The main JS is 86 KB gzipped, the CSS is 7.6 KB gzipped, and fonts are woff2 Latin subsets.
- SMTP lead notifications (no SMTP credentials).
- The Amazon Bedrock adapter (no AWS account or model access).
- The Docker image build (Docker was not run).
- Safari, Firefox and real devices. Only the Chromium-based built-in browser was used.
- Screen-reader walkthrough. Labels, roles, live regions and keyboard paths were implemented and spot-checked only.
