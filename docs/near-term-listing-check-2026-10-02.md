# Near-term listing check — October 2, 2026

Rechecked the live provider pages before editing these three stable event IDs.

| ID / date | Verified source and current behavior |
| --- | --- |
| `arvind` / Oct 3 | [Sulekha](https://events.sulekha.com/arvind-vegda-and-devanshi-shah-live-in-chicago_event-in_bartlett-il_400543) explicitly marks the event cancelled and says refunds have been initiated. Preserve the record with the existing `status: "cancelled"`; exclude it from upcoming results. Disclose the cancellation in listing updates and any previously saved shortlist entry. |
| `geeta` / Oct 4 | [Sulekha](https://events.sulekha.com/garba-ramzat-with-geeta-rabari-live-in-chicago_event-in_schaumburg-il_401522) marks online inventory sold out and says gate tickets may still be available, requiring organizer confirmation. Keep the event upcoming without a new status. Show the online/gate caveat and label the destination **Event details**. |
| `aura` / Oct 9 | [Sulekha](https://events.sulekha.com/unlimited-aura-sivaangi-maanasi-live-chicago_event-in_naperville-il_401960) provides event information. Its “Know More” button reveals the on-page event-details section; the [provider's button handler](https://events.sulekha.com/common/js/ticketcal_v3.js?ver=0.0.0.5.5.6.6.9) does not navigate to checkout. No ticket purchase path was verified. Keep upcoming and label all three listing destinations **Event details**, with a purchase-path caveat. |

`verifiedOn` uses the existing per-record convention. Optional `availabilityNote` text appears in the lineup and shortlist; the existing `note` supplies the longer detail explanation. Optional `linkLabel` changes the visible destination label and the lineup accessible name, retaining the defaults for every other event.

Click attribution remains the existing `select_content` event with stable `content_id` and `link_type: "tickets"` for these non-free records. That legacy field classifies listing links, not live purchase availability. No new tracking or analytics policy change is introduced.

Regression coverage uses real local rendering on desktop and mobile: cancellation across filters, saved cancellation disclosure and removal, availability wording, destination labels, verification dates, existing analytics payloads, and analytics refusal. External requests are blocked or locally stubbed; outbound clicks are intercepted before navigation, including popups.

Gate inventory and an alternative Aura purchase path remain unverified. Listings are manually curated and provider availability may change after this check.

Current main `143fe34e95af1a2fe4c0462a527a84c87add0439` was merged into the feature branch after PR #11. The shared metadata keeps the Diwali Morning Concert verification note alongside the three near-term checks. The full Shounak/Abhed/Makarand record matches main exactly; only `arvind`, `geeta`, and `aura` differ among the 57 event records. Regression checks also cover searching for Abhed and Makarand, the expanded detail copy, and both source notes. Screenshot comparisons were refreshed against this current main baseline.
