# Regional analytics rollout

## Outcome and scope

Keep the existing GA4 stream and event hooks. Start analytics automatically outside the EEA, UK, and Switzerland for visitors who have not declined and do not signal Global Privacy Control. Require an affirmative choice in the EEA, UK, Switzerland, and when country detection fails. Keep a footer control for every visitor. Advertising storage, personalization, and Google signals stay disabled.

The policy is the selected EEA/UK/Switzerland policy, not an exhaustive worldwide legal determination. Country is taken from the same-origin Cloudflare trace endpoint, not browser language or timezone. The trace response is only parsed for country; it is not persisted or sent to analytics. No new server or third-party location service is required.

## Implementation

- [x] Add a bounded country lookup and protect asynchronous completion against later privacy choices.
- [x] Preserve explicit granted/denied choices and block analytics when Global Privacy Control is enabled.
- [x] Scope GA cookies to this hostname, stop analytics and clear this stream's host cookies on opt-out.
- [x] Update consent/settings disclosure to describe actual behavior and identify Google.
- [x] Update publication instructions and automation wording so later content updates preserve regional behavior.
- [x] Verify the country/consent/privacy matrix, rendered UI, and production publication.
- [x] Commit, push, attach a PR, and report deployed evidence.

## Verification

Use an external Node VM smoke harness for automatic US/India behavior, EEA/UK/Switzerland and unknown country gating, prior choices, Global Privacy Control, failed/timed-out lookup, unavailable storage, and opt-out during pending lookup. Use a temporary local server to verify rendered US and European behavior and privacy controls, including mobile. Verify the live source and successful HTTPS response after Direct Upload.

## Evidence and decisions

Google's EU User Consent Policy covers EEA, UK, and Switzerland and requires disclosures and consent for cookies where required: https://www.google.com/about/company/user-consent-policy/ . The user selected automatic analytics elsewhere, overriding the proposed US-only default. Separately geolocated EEA territories also require consent; unknown location asks first. Google's cookie configuration supports explicit subdomain scope: https://developers.google.com/tag-platform/security/guides/customize-cookies . Cloudflare owns the /cdn-cgi/ endpoint: https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/ . The live trace endpoint was checked and returned loc=US.

## Completion

Implemented and locally verified. Twelve external Node VM scenario groups passed, including every protected country/territory, privacy signals, saved choices, storage failure, lookup timeout, and choice/lookup races. Chrome verified automatic US loading, European prompt-before-load, grant, persisted opt-out, and GPC. Desktop and 390x844 mobile rendered without overflow or console warnings/errors. Local tests used a stub Google script to avoid sending test visits. Initial production verification found a returning Chrome tab still executing the cached pre-change analytics script. Added content-versioned analytics and stylesheet URLs to force refresh on this rollout. The final Cloudflare deployment is https://a5be5598.desi-on-stage-chicago.pages.dev/ . Production at https://desievents.luckbhi.com/ loaded the versioned analytics script, received a US country result, hid the prompt, and loaded Google automatically. Google collection returned HTTP 204; an event_filter request targeted G-KMQVM6H2VK. No relevant console errors or warnings were observed. The content automation was updated and verified to preserve the selected regional behavior; its schedule/model/project stayed unchanged. Source is committed and pushed; the PR records this scoped rollout. GA4 Realtime reporting and its administrative stream URL were not inspected. IP geolocation is approximate and this region policy is not a worldwide legal audit.
