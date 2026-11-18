# Pre-deployment checklist

## Facts to confirm (blocking publication of the matching text)
- [ ] Founder name spelling (Muhammed or Mohammed) and title
- [ ] `ogunlakin@klearway.site` mailbox exists, is monitored, and who answers it
- [ ] Team size for LinkedIn and AWS Activate
- [ ] Headquarters or registered address (optional; currently not shown)
- [ ] Company WhatsApp number, if you want click-to-chat links (PRD US-012)
- [ ] Verified URLs for the three industry sources in `src/data/content.js`
- [ ] Legal review of `/privacy` and `/terms` (NDPA 2023, liability cap, retention, governing law)
- [ ] A practising clearing agent reviews the demo documents and milestone wording (PRD Q3)

## Infrastructure
- [ ] `www.klearway.site` DNS points to the host. Redirect the apex `klearway.site` to `www`.
- [ ] HTTPS certificate is active, and HTTP redirects to HTTPS
- [ ] `WORKSPACE_ACCESS_KEY` is set to a long random value, shared only with pilot firms
- [ ] `DATA_DIR` sits on a persistent, backed-up volume. Encryption at rest is enabled on the volume.
- [ ] SMTP (or Amazon SES) credentials are set, and a test lead email has been received
- [ ] `PUBLIC_ORIGIN=https://www.klearway.site`
- [ ] Process manager restarts the service on failure and reboot
- [ ] Rate limiting at the proxy or WAF for `/api/leads`

## Verification after deploy
- [ ] `GET /api/health` returns `accessKeyRequired: true`
- [ ] The workspace asks for the key, rejects a wrong key and accepts the right one
- [ ] Load the sample shipment, run checks, and confirm 2 mismatches
- [ ] Submit a pilot request and receive the notification email
- [ ] `/privacy`, `/terms`, `/robots.txt` and `/sitemap.xml` load; an unknown path returns 404
- [ ] Open Graph preview checked (LinkedIn Post Inspector)
- [ ] Lighthouse mobile run (target 90 or higher) and a WebPageTest throttled 3G run (target under 3 s)
- [ ] Checked on iOS Safari and Android Chrome
- [ ] Submit the sitemap to Google Search Console

## Then update the record
- [ ] Record the deployed URL and test results in `docs/mvptest.md`
- [ ] Update `docs/implementation-status.md` and the "MVP status" section on the site
- [ ] Change the AWS Activate stage only when pilot users are actually using the deployed MVP
