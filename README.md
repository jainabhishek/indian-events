# Desi Chicago

An independent, mobile-friendly guide to Indian music and comedy across Chicagoland. Original patterned-cloth hero artwork, searchable upcoming shows, category and location filters, event details, ticket-provider links, and a device-local shortlist.

## Listings

Edit the curated `events` array in `script.js`. Check date, local time, venue, age restrictions, and event-specific organizer or ticket URLs before updating the verification date in `index.html`. Past events hide using the Chicago calendar date. The edition label is editorial and should be updated with each new lineup. Listings are manually curated, not a live ticket inventory feed.

## Preview

Serve this directory with any static web server. No package installation or build step is required.

## Publish

Live website: https://desievents.luckbhi.com/

Cloudflare Pages project: `desi-on-stage-chicago`. It uses Direct Upload; pushing source does not deploy it. Copy only `index.html`, `styles.css`, `script.js`, `analytics.js`, and `assets/` into a clean staging directory, then run:

```sh
wrangler pages deploy <staging-directory> --project-name desi-on-stage-chicago --branch main
```

The Cloudflare-managed `luckbhi.com` zone has a `desievents` CNAME pointing to `desi-on-stage-chicago.pages.dev`. The subdomain is attached to the Pages project as an active custom domain with HTTPS.

The former `events.abhishekja.in` custom domain has been detached; no redirect is configured. Its obsolete GoDaddy `events` CNAME has also been deleted; GoDaddy authoritative DNS confirms the old hostname no longer exists. Chicago remains the current edition. Future city editions can use paths under `desievents.luckbhi.com`, such as `/chicago`, without introducing separate city subdomains.

## Analytics and privacy

Existing GA4 stream `G-KMQVM6H2VK` is preserved in `analytics.js`. Google loads automatically outside the EEA, UK, and Switzerland for visitors who have not declined and do not signal Global Privacy Control. For the EEA (including separately geolocated territories), UK, Switzerland, or an unknown country, it loads only after **Allow analytics**. The same-origin Cloudflare `/cdn-cgi/trace` endpoint supplies country; its response is not persisted or sent to Google, and a failed/3-second timed-out lookup requires consent. Automatic regional permission lasts only for the current page and is never saved as an explicit grant. Existing granted/denied choices retain their browser storage key. The footer **Analytics choice** control remains available everywhere; opt-out disables collection immediately, clears this stream's host-scoped GA cookies, and reloads if the refusal was saved. With blocked storage, it keeps collection disabled without reloading. GA cookies are scoped to this hostname, and advertising storage, personalization, and Google signals stay disabled. The analytics script and stylesheet use content-versioned URLs in `index.html`; update their version values when changing those assets so returning browsers refresh them. The country rules implement the selected EEA/UK/Switzerland policy; they are not an exhaustive worldwide legal assessment. Ticket-link and category interactions report public event IDs and category values, never search terms or shortlist contents. The shortlist stays in browser storage; no account, email, or payment information is collected.

## Artwork

The header, footer, and favicon use a custom SVG charkha (traditional spinning wheel), so the brand symbol cannot be substituted with an emoji by iOS.

`assets/sound-sculpture-patterned.webp` is an original imagegen edit restoring the concept's ivory-on-coral paisley and floral textile print while preserving the chrome microphone, blue vinyl record, spheres, white background, and composition. The website uses optimized WebP. Event artwork is stored in `assets/events/`, with its source URL recorded as `imageSource` in each event. Local copies avoid broken third-party hotlinks. Initials remain the fallback when suitable artwork is unavailable. Free events is an exclusive category alongside All nights, Music, and Comedy, and combines with search and location filters.

## Mobile layout and feedback

The mobile hero uses cropped background artwork and a compact introduction, with search and location behind “Search & filters.” Desktop artwork moves up to 36px with scrolling; mobile artwork stays static. Reduced-motion preferences disable parallax and haptics. Deliberate taps request a 10ms vibration on touch devices that support `navigator.vibrate`; iPhone Safari does not support this API, so controls retain visual pressed feedback there. Physical vibration requires verification on a supported device.
