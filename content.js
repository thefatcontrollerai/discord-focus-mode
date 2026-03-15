/**
 * Discord Focus Mode - content.js
 * Watches chrome.storage for changes and applies body classes directly.
 * No message passing needed — storage is the single source of truth.
 */

const FEATURES = [
  { key: 'dfm_active',       cls: 'dfm-active'       },
  { key: 'dfm_bubble',       cls: 'dfm-bubble'       },
  { key: 'dfm_hide_gif',     cls: 'dfm-hide-gif'     },
  { key: 'dfm_hide_sticker', cls: 'dfm-hide-sticker' },
  { key: 'dfm_hide_gift',    cls: 'dfm-hide-gift'    },
  { key: 'dfm_hide_apps',    cls: 'dfm-hide-apps'    },
];

function applyAll(store) {
  FEATURES.forEach(({ key, cls }) => {
    document.body.classList.toggle(cls, !!store[key]);
  });
}

function init() {
  // Restore on load
  chrome.storage.local.get(FEATURES.map(f => f.key), applyAll);

  // React to any change from the popup immediately
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    FEATURES.forEach(({ key, cls }) => {
      if (key in changes) {
        document.body.classList.toggle(cls, !!changes[key].newValue);
      }
    });
  });

  // Alt+H toggles sidebar focus mode
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      const active = !document.body.classList.contains('dfm-active');
      chrome.storage.local.set({ dfm_active: active });
      // storage.onChanged will apply it
    }
  });
}

function waitForDiscord() {
  const ready =
    document.querySelector('nav[aria-label*="Servers"]') ||
    document.querySelector('[class*="guilds"]') ||
    document.querySelector('[class*="sidebarList"]') ||
    document.querySelector('div[class*="app-"]');

  if (ready) init();
  else setTimeout(waitForDiscord, 300);
}

waitForDiscord();
