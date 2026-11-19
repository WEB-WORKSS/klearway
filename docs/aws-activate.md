# AWS Activate: consistent answers

These answers are drawn from the same business record as the website and the LinkedIn kit. They describe Klearway **as it is today**. Update them only when the facts change, with evidence.

| Question | Answer |
|---|---|
| Company name | Klearway |
| Website | https://www.klearway.site |
| Company email | ogunlakin@klearway.site (**confirm** the mailbox is active and use the founder's own account details where the form asks for them) |
| Founded | 2026 |
| Founder | Muhammed Ogunlakin, Founder & CEO, https://www.linkedin.com/in/ogunlakin-mohammed/ |
| Company LinkedIn | https://www.linkedin.com/company/klear-way/ |
| Team size | **Verify** before submitting (only the founder has been confirmed) |
| Funding | None claimed. Answer "self-funded / no institutional funding" only if that is true. |
| Industry | Software, logistics technology (B2B SaaS) |
| **Stage** | **Ideating / building initial product.** The core MVP runs end to end locally but is not deployed or in use by pilot users. Switch to "Launched initial product and iterating" only after a deployed MVP is in use by at least one pilot firm, and keep the evidence. |

## Short description (for "describe your product")

> Klearway is B2B software for freight forwarders and clearing agents in Nigeria. A firm uploads a shipment's bill of lading, commercial invoice and packing list. Klearway extracts the key fields, shows each value next to its source for a person to confirm, and cross-checks the documents for mismatches (consignee, package count, weight, quantity, invoice reference, container numbers) before submission. Each shipment keeps its milestones and blockers, and Klearway drafts importer status updates from confirmed milestones. Our MVP runs this workflow end to end; we are preparing a hosted pilot.

## How we plan to use AWS (proposed architecture, nothing deployed yet)

- **Amazon S3 + AWS KMS:** encrypted storage for uploaded shipping documents, separated per firm.
- **Amazon Textract:** text, key-value and table extraction from scanned and photographed documents.
- **Amazon Bedrock (+ Guardrails):** mapping unfamiliar document layouts to Klearway's fields, with source text for each value; output restricted to document fields.
- **AWS Lambda + Amazon API Gateway:** upload handling, extraction, the check rules and update drafting.
- **Amazon DynamoDB:** shipments, confirmed fields, check runs, milestones and the update log.
- **Amazon Cognito:** staff sign-in and roles per firm.
- **Amazon SES:** pilot-request notifications and importer emails.
- **AWS Amplify Hosting:** the prerendered website and workspace front end.

## What credits would be used for

Hosting the pilot environment, running Textract and Bedrock on pilot firms' documents, and testing extraction accuracy on real Nigerian shipping documents. Accuracy must be measured before any accuracy claim is published (PRD section 7).

## Don't claim

- That any AWS service is in production, or that the product is "powered by Amazon Bedrock".
- Customers, users, revenue, pilots in progress, partnerships or certifications.
- A product launch date.
