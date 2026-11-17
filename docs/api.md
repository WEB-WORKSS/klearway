# Klearway API

Base path: `/api`. JSON in and out, except for document upload (multipart) and file download.
Errors look like `{ "error": "message", "details": { "field": "message" } }`, with status 400, 401, 404, 413, 415, 422, 429 or 500.

## Health

`GET /api/health` returns `{ ok, service, accessKeyRequired, ai: { enabled, reason }, leadEmail }`

## Workspace

When `WORKSPACE_ACCESS_KEY` is set, every request needs the header `x-workspace-key: <key>`. Without it, the response is `401`.

| Method & path | Body | Result |
|---|---|---|
| `GET /workspace/session` | | `{ ok, ai, milestones, docTypes }` |
| `GET /workspace/settings` | | `{ firmName }` |
| `PUT /workspace/settings` | `{ firmName }` | `{ firmName }` |
| `GET /workspace/shipments` | | `{ shipments: Summary[] }`, newest first |
| `POST /workspace/shipments` | `{ ref*, mode* (sea\|air\|road), importerName, importerPhone (Nigerian mobile), importerEmail, origin, destination, goods }` | `201 Shipment` or `422` |
| `GET /workspace/shipments/:id` | | `Shipment` |
| `PATCH /workspace/shipments/:id` | any of the fields above, plus `blocker: { text, owner } \| null` | `Shipment` |
| `DELETE /workspace/shipments/:id` | | `204`; also deletes the stored files |
| `POST /workspace/shipments/:id/documents` | multipart: `file` (PDF, TXT, CSV, JPG, PNG or WebP; at most 10 MB), optional `type` | `201 Document` (type detected and fields extracted) |
| `GET /workspace/shipments/:id/documents/:docId/file` | | the stored file, inline |
| `PATCH /workspace/shipments/:id/documents/:docId` | `{ type?, fields?: { key: { value, confirmed } } }` | `Document`. A changed type re-runs extraction. An edited value is marked `source: manual`. |
| `DELETE /workspace/shipments/:id/documents/:docId` | | `204` |
| `POST /workspace/shipments/:id/checks` | | `201 CheckRun`, saved at the front of `checkRuns` |
| `PATCH /workspace/shipments/:id/milestones/:key` | `{ status: done\|pending, date (YYYY-MM-DD, required for done), note }` | `Shipment` |
| `GET /workspace/shipments/:id/update-draft` | | `{ message }`, built from confirmed milestones |
| `POST /workspace/shipments/:id/updates` | `{ message, channel: whatsapp\|email\|copy }` | `201 UpdateLogEntry` (status `prepared`) |
| `POST /workspace/sample` | | `201 Shipment`: a fictional shipment built from `public/samples/*.pdf` through the normal pipeline, with `isSample: true` |

## Leads

`POST /api/leads` (no key needed). It has a honeypot field (`website`) and a rate limit of 5 per IP per 10 minutes.

- Pilot request: `{ kind: "pilot", fullName*, email*, company*, companySize* (1-2\|3-10\|11-30\|31-100\|100+), useCase*, role, whatsapp, location, shipmentsPerMonth, modes[], trackingToday, plan, message, utm{}, page }`
- Contact message: `{ kind: "contact", fullName*, email*, company*, topic*, message* (at least 10 characters), whatsapp }`

On success it returns `201 { ok, id, stored: true, notified, confirmationSent }`. `notified` is `true` only when SMTP is configured and the notification email was accepted.

## Data model (`DATA_DIR/db.json`)

```
settings  { firmName }
shipments [{ id, ref, mode, importerName, importerPhone, importerEmail, origin, destination, goods,
             isSample, createdAt, updatedAt, blocker{text,owner,since}|null,
             milestones[{ key, label, status, date, note, confirmedAt }],
             documents[{ id, type, typeGuessed, originalName, storedName, mime, size, pages, uploadedAt, text,
                         extraction{ method, status, message, ranAt,
                                     fields{ key: { value, source: extracted|manual|ai, confirmed, snippet, confirmedAt } } } }],
             checkRuns[{ id, ranAt, summary{mismatch,missing,warning,pass},
                         results[{ id, rule, status, title, detail, documents[] }] }],
             updates[{ id, channel, message, stage, preparedAt, status: prepared }] }]
leads     [{ id, kind, ...fields, submittedAt, utm, page }]
```

There are no migrations: the store fills in any missing top-level collections on load. The proposed DynamoDB design has one table with partition key `FIRM#<id>` and sort keys `SHIP#<id>`, `SHIP#<id>#DOC#<id>`, `SHIP#<id>#RUN#<ts>` and `LEAD#<id>`.
