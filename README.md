# Desi on Stage · Chicago

A static, curated guide to Indian and Indian-origin music and comedy around Chicago. Open `index.html` locally or serve this directory with any static server.

## Update listings

Edit the `events` array in `script.js`. Use an event-specific organizer, venue, or primary ticket link. Recheck active listings before changing the `Listings checked` date in `index.html`. Remove or label cancelled events. The browser hides past dates automatically.

## Deploy

The live site is at [events.abhishekja.in](https://events.abhishekja.in/). Cloudflare Pages uses Direct Upload, so source commits do not deploy automatically. To deploy, copy `index.html`, `styles.css`, `script.js`, `analytics.js`, `spark.svg`, and `stage-art-v2.png` into a clean directory and run `wrangler pages deploy <directory> --project-name desi-on-stage-chicago --branch main`.

The custom domain `events.abhishekja.in` uses a GoDaddy CNAME named `events` pointing to `desi-on-stage-chicago.pages.dev`.

## Analytics

The GA4 web stream ID is `G-KMQVM6H2VK` in `analytics.js`. The Google tag loads only after a visitor selects **Allow analytics**. The choice is saved locally and can be changed with the footer's **Analytics choice** button. Declining or revoking consent stops analytics on the next page load.

GA4 receives page views, `select_content` events with a public event `content_id` when a listing link is clicked, and `event_filter` events with `filter_name` when a filter is selected. To report on filter values, create an event-scoped custom dimension for `filter_name` in GA4. No subscriber email addresses are sent by this site.
