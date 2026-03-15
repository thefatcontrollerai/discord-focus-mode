/**
 * Discord Focus Mode - content.js
 * Each feature maps to a body class. Popup sends setClass messages.
 */

// All feature keys → body classes
const FEATURES = [
  { key: 'dfm_active',        cls: 'dfm-active'        },
  { key: 'dfm_bubble',        cls: 'dfm-bubble'        },
  { key: 'dfm_hide_gif',      cls: 'dfm-hide-gif'      },
  { key: 'dfm_hide_sticker',  cls: 'dfm-hide-sticker'  },
  { key: 'dfm_hide_gift',     cls: 'dfm-hide-gift'     },
  { key: 'dfm_hide_apps',     cls: 'dfm-hide-apps'     },
];

const DFM = {
  init() {
    // Restore all feature states from storage
    const keys = FEATURES.map(f => f.key);
    chrome.storage.local.get(keys, (result) => {
      FEATURES.forEach(({ key, cls }) => {
        if (result[key]) document.body.classList.add(cls);
      });
    });

    // Keyboard shortcut: Alt+H toggles sidebar focus mode only
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        const active = document.body.classList.toggle('dfm-active');
        chrome.storage.local.set({ dfm_active: active });
      }
    });

    // Listen for popup messages
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'setClass') {
        document.body.classList.toggle(msg.cls, msg.active);
      }
    });
  }
};

function waitForDiscord() {
  const ready =
    document.querySelector('nav[aria-label*="Servers"]') ||
    document.querySelector('[class*="guilds"]') ||
    document.querySelector('[class*="sidebarList"]') ||
    document.querySelector('div[class*="app-"]');

  if (ready) DFM.init();
  else setTimeout(waitForDiscord, 300);
}

waitForDiscord();
