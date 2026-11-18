# Implementation status matrix

**Declared stage:** MVP **locally functional**, not deployed. In public, this is described as "MVP in development". For AWS Activate, choose **"Ideating / building initial product"** until a deployed MVP is reachable by pilot users. See `aws-activate.md`.

## Product capabilities

| Capability | Status | Where |
|---|---|---|
| Create, edit and delete shipments; search and filter | **Implemented and tested** | `routes/workspace.js`, `ShipmentList.jsx` |
| Upload documents (PDF, TXT, CSV, JPG, PNG, WebP; at most 10 MB), stored persistently | **Implemented and tested** | multer, `DATA_DIR/uploads` |
| Automatic document-type detection | **Implemented and tested** (keyword based) | `extract.js#guessType` |
| Field extraction from digital PDFs and text files, with source snippets | **Implemented and tested** (label based) | `extract.js` |
| Person reviews, edits and confirms fields beside the stored document | **Implemented and tested** | `DocumentReview.jsx` |
| Cross-document checks and ISO 6346 validation, with saved history | **Implemented and tested** | `checks.js` |
| Milestones, blockers and owners | **Implemented and tested** | `milestones.js`, `StatusPanel.jsx` |
| Importer update drafting, opened in WhatsApp (wa.me) or email, and logged | **Implemented and tested** (staff send it manually) | `UpdatesPanel.jsx` |
| Pilot access key protecting the workspace API | **Implemented and tested** | `routes/workspace.js` |
| Lead and contact forms: validation, honeypot, rate limit, storage | **Implemented and tested** | `routes/leads.js` |
| Lead notification and confirmation email (SMTP) | **Written, not tested** (no credentials) | `notify.js` |
| AI-assisted extraction (Amazon Bedrock Converse) | **Written, not tested** (no AWS access). Off by default. | `ai.js` |
| Reading scans and photos (OCR, Textract) | **Planned** (being built) | n/a |
| Per-user accounts and roles (Cognito) | **Planned** (being built) | n/a |
| Hosted pilot environment | **Not deployed** | n/a |
| Receiving documents by WhatsApp or forwarded email | **Roadmap** | n/a |
| Automatic importer updates through the WhatsApp Business Platform | **Roadmap** (needs Meta approval and costs, PRD Q9) | n/a |
| Deadline and storage-cost reminders | **Roadmap** | n/a |
| Analytics events (PRD FR-11) | **Not implemented**: no analytics tool chosen. `data-cta` attributes are in place. | n/a |

## AWS services

| Service | Status |
|---|---|
| All services named on the website (S3, KMS, Textract, Bedrock, Bedrock Guardrails, Lambda, API Gateway, DynamoDB, Cognito, SES, Amplify Hosting) | **Proposed architecture.** None is deployed or configured. |
| `@aws-sdk/client-bedrock-runtime` | A dependency is installed and adapter code exists, but it has not been run. |

## Business facts needing confirmation (not published as fact)

| Item | Current handling |
|---|---|
| Team size | Only the founder was supplied. The website shows only the founder; LinkedIn "2-10" is a default to **verify**. |
| Founder name spelling | The site uses "Muhammed Ogunlakin" as supplied. The LinkedIn URL slug is "ogunlakin-mohammed". **Verify** the preferred spelling. |
| Business email | `ogunlakin@klearway.site`. Confirm the mailbox exists and is monitored. |
| Headquarters / address | Not supplied, so not published. |
| WhatsApp contact number | Not supplied, so no WhatsApp click-to-chat link for Klearway itself (PRD US-012 is partially met: email links only). |
| Pricing | Not confirmed, so "Pricing on request" (PRD Q4). |
| Response time for pilot requests | Not confirmed, so not stated (PRD Q8). |
| Industry sources | Citations are listed as described in the PRD. **Add verified URLs** to each source before launch. |
| Name "Klearway" vs PRD "Clearway" | Part A ("Klearway", klearway.site) is used throughout. |
| Legal | Privacy Policy and Terms are drafted for current operations and **need legal review**: NDPA 2023 compliance, the ₦100,000 liability cap, the 24-month lead retention, and governing law. |
