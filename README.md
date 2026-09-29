# Desi Chicago

An independent, mobile-friendly guide to Indian music and comedy across Chicagoland. Original patterned-cloth hero artwork, searchable upcoming shows, category and location filters, event details, ticket-provider links, and a device-local shortlist.

## Listings

Edit the curated `events` array in `script.js`. Check date, local time, venue, age restrictions, and event-specific organizer or ticket URLs before updating the verification date in `index.html`. Past events hide using the Chicago calendar date. The edition label is editorial and should be updated with each new lineup. Listings are manually curated, not a live ticket inventory feed.

## Preview

Serve this directory with any static web server. No package installation or build step is required.

## Publish

Live website: https://events.abhishekja.in/

Cloudflare Pages project: `desi-on-stage-chicago`. It uses Direct Upload; pushing source does not deploy it. Copy only `index.html`, `styles.css`, `script.js`, `analytics.js`, and `assets/` into a clean staging directory, then run:

```sh
wrangler pages deploy <staging-directory> --project-name desi-on-stage-chicago --branch main
```

The GoDaddy `events` CNAME points to `desi-on-stage-chicago.pages.dev`.

## Analytics and privacy

Existing GA4 stream `G-KMQVM6H2VK` is preserved in `analytics.js`. Google loads only after **Allow analytics**, retaining existing consent choices under the same browser storage key. The footer **Analytics choice** control permits changing consent; revoking reloads the page with Google disabled. Ticket-link and category interactions report public event IDs and category values, never search terms or shortlist contents. The shortlist stays in browser storage; no account, email, or payment information is collected.

## Artwork

The header, footer, and favicon use a custom SVG charkha (traditional spinning wheel), so the brand symbol cannot be substituted with an emoji by iOS.

`assets/sound-sculpture-patterned.webp` is an original imagegen edit restoring the concept's ivory-on-coral paisley and floral textile print while preserving the chrome microphone, blue vinyl record, spheres, white background, and composition. The website uses optimized WebP. Organizer event artwork is loaded from source providers, with initials as a fallback.
