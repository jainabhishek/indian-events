// Set this to the GA4 web stream ID (G-...) for the Desi on Stage account.
const GA_MEASUREMENT_ID = '';
const consentKey = 'desi-on-stage-analytics-consent';
const consentBanner = document.querySelector('#analytics-consent');
const savedConsent = (() => {
  try { return localStorage.getItem(consentKey); } catch { return null; }
})();
let currentConsent = savedConsent;
let initialized = false;

function startAnalytics() {
  if (initialized || !/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return;
  initialized = true;
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
    allow_ad_personalization_signals: false
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.append(script);
}

window.siteAnalytics = {
  track(name, parameters) {
    if (currentConsent === 'granted' && initialized) window.gtag('event', name, parameters);
  }
};

if (currentConsent === 'granted') startAnalytics();
else if (currentConsent !== 'denied') consentBanner.hidden = false;

document.querySelector('#privacy-settings').addEventListener('click', () => {
  consentBanner.hidden = false;
  document.querySelector('#analytics-allow').focus();
});

function chooseAnalytics(choice) {
  try { localStorage.setItem(consentKey, choice); } catch { /* Keep choice for this page. */ }
  const previouslyGranted = currentConsent === 'granted';
  currentConsent = choice;
  consentBanner.hidden = true;
  if (choice === 'granted') startAnalytics();
  else if (previouslyGranted) {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    location.reload();
  }
}

document.querySelector('#analytics-allow').addEventListener('click', () => chooseAnalytics('granted'));
document.querySelector('#analytics-decline').addEventListener('click', () => chooseAnalytics('denied'));
