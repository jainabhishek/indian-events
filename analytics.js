const GA_MEASUREMENT_ID = 'G-KMQVM6H2VK';
const consentKey = 'desi-on-stage-analytics-consent';
// EEA, UK, Switzerland, and EEA territories reported separately by geolocation.
const consentCountries = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
  'AX', 'GF', 'GP', 'MF', 'MQ', 'RE', 'YT'
]);
const consentBanner = document.querySelector('#analytics-consent');
const consentMessage = document.querySelector('#analytics-message');
const allowButton = document.querySelector('#analytics-allow');
const declineButton = document.querySelector('#analytics-decline');
const closeButton = document.querySelector('#analytics-close');
const privacyOptOut = navigator.globalPrivacyControl === true;
const savedConsent = (() => {
  try {
    const choice = localStorage.getItem(consentKey);
    return choice === 'granted' || choice === 'denied' ? choice : null;
  } catch { return null; }
})();
let currentConsent = privacyOptOut ? 'denied' : savedConsent;
let initialized = false;
let choiceRevision = 0;
let settingsOpened = false;

function startAnalytics() {
  if (privacyOptOut || currentConsent !== 'granted' || !/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return;
  if (initialized) {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  initialized = true;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: location.hostname
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.append(script);
}

function showAnalyticsChoice(settings = false) {
  settingsOpened = settings;
  consentMessage.textContent = privacyOptOut
    ? 'Google Analytics is off because your browser requests a privacy opt-out. Your shortlist stays on this device.'
    : settings
      ? `Google Analytics is ${currentConsent === 'granted' ? 'on' : 'off'}. It measures visits, ticket clicks, and category choices using cookies. You can turn it off here. Your shortlist stays on this device.`
      : 'May we use Google Analytics cookies to measure visits, ticket clicks, and category choices? Nothing is sent to Google until you allow it. Your shortlist stays on this device.';
  allowButton.hidden = privacyOptOut;
  declineButton.hidden = privacyOptOut;
  allowButton.textContent = settings ? 'Turn on analytics' : 'Allow analytics';
  declineButton.textContent = settings ? 'Turn off analytics' : 'No thanks';
  closeButton.hidden = !settings;
  consentBanner.hidden = false;
}

function clearAnalyticsCookies() {
  const names = ['_ga', `_ga_${GA_MEASUREMENT_ID.slice(2)}`];
  for (const name of names) {
    const expired = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = expired;
    document.cookie = `${expired}; domain=${location.hostname}`;
  }
}

async function initializeAnalytics() {
  if (privacyOptOut || currentConsent === 'denied') {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    clearAnalyticsCookies();
    return;
  }
  if (currentConsent === 'granted') {
    startAnalytics();
    return;
  }
  const revision = choiceRevision;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  let country = null;
  try {
    const response = await fetch('/cdn-cgi/trace', {
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal
    });
    if (response.ok) country = (await response.text()).match(/^loc=([A-Z]{2})\r?$/m)?.[1] || null;
  } catch { /* An unknown country requires consent before loading Google. */ }
  finally { clearTimeout(timeout); }
  if (revision !== choiceRevision) return;
  if (country && country !== 'XX' && !consentCountries.has(country)) {
    // This default applies to this visit only; it is not saved as explicit consent.
    currentConsent = 'granted';
    startAnalytics();
    if (settingsOpened) showAnalyticsChoice(true);
  } else if (!settingsOpened) showAnalyticsChoice();
}

window.siteAnalytics = {
  track(name, parameters) {
    if (currentConsent === 'granted' && initialized && !privacyOptOut) window.gtag('event', name, parameters);
  }
};

document.querySelector('#privacy-settings').addEventListener('click', () => {
  showAnalyticsChoice(true);
  (privacyOptOut ? closeButton : declineButton).focus();
});

function chooseAnalytics(choice) {
  if (privacyOptOut && choice === 'granted') return;
  choiceRevision++;
  try { localStorage.setItem(consentKey, choice); } catch { /* Honor the choice for this visit even when storage is blocked. */ }
  const wasInitialized = initialized;
  currentConsent = choice;
  consentBanner.hidden = true;
  if (choice === 'granted') startAnalytics();
  else {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
    // Unload Google's code after revocation. If storage is blocked, stay on this
    // page with collection disabled rather than restoring the automatic default.
    let persisted = false;
    try { persisted = localStorage.getItem(consentKey) === 'denied'; } catch { /* Collection remains disabled. */ }
    if (wasInitialized && persisted) location.reload();
  }
}

allowButton.addEventListener('click', () => chooseAnalytics('granted'));
declineButton.addEventListener('click', () => chooseAnalytics('denied'));
closeButton.addEventListener('click', () => { consentBanner.hidden = true; });
initializeAnalytics();
