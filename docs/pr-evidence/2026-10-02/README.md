# Listing accuracy visual evidence

Before: untouched `main` at `143fe34e95af1a2fe4c0462a527a84c87add0439`.
After: this branch's listing changes with current main merged in. Both retain the expanded Shounak/Abhed/Makarand lineup from PR #11. Both use Chromium, fixed October 2, 2026
at 17:00 UTC, reduced motion, and the same viewport: desktop 1440×1000 or
mobile 390×844. Garba screenshots capture the full page, so content removal
changes image height. Dialog screenshots capture the viewport.

The same saved IDs (`arvind`, `geeta`, `aura`) represent a previously saved
shortlist. No event data is mocked. Each run searches Garba with listing updates
expanded, opens Aura details from a Sivaangi search, then opens the shortlist.
The extra mobile pair scrolls Aura's shortlist link into view because the longer
disclosures require vertical dialog scrolling.

All 14 images were inspected visually: Arvind leaves upcoming results; Geeta
retains its date with online sold-out/gate uncertainty; Aura and saved entries
use Event details. Updated notes and labels wrap within the existing listing
layout. No page errors or external network requests occurred during capture.

The untouched baseline and changed page both have a small mobile header overflow
at 390px: the contact control extends about 7px beyond the viewport. This remains
outside the listing-accuracy scope. The changed listing and dialog controls fit
horizontally; the shortlist scrolls vertically through all entries.

Reproduce from the repository root after `npm ci` and installing Chromium:

```sh
mkdir -p /tmp/indian-events-listing-baseline
git archive 143fe34e95af1a2fe4c0462a527a84c87add0439 | tar -x -C /tmp/indian-events-listing-baseline
node docs/pr-evidence/2026-10-02/capture.mjs /tmp/indian-events-listing-baseline
```

New captures go into ignored `output/playwright/near-term-2026-10-02/`.
`capture-results.json` records viewport sizes, visible IDs, rendered copy, and
baseline/after layout measurements for these committed captures.
