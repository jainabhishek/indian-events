# Desi on Stage · Chicago

A static, curated guide to Indian and Indian-origin music and comedy around Chicago. Open `index.html` locally or serve this directory with any static server.

## Update listings

Edit the `events` array in `script.js`. Use an event-specific organizer, venue, or primary ticket link. Recheck active listings before changing the `Listings checked` date in `index.html`. Remove or label cancelled events. The browser hides past dates automatically.

## Deploy

The live site is at [desi-on-stage-chicago.pages.dev](https://desi-on-stage-chicago.pages.dev/). Cloudflare Pages uses Direct Upload, so source commits do not deploy automatically. To deploy, copy `index.html`, `styles.css`, `script.js`, and `stage-art.png` into a clean directory and run `wrangler pages deploy <directory> --project-name desi-on-stage-chicago --branch main`.

The custom domain `events.abhishekja.in` uses a GoDaddy CNAME named `events` pointing to `desi-on-stage-chicago.pages.dev`.
