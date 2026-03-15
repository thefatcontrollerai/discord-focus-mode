// Feature map: storageKey → body class (injected in content.js)
const FEATURES = [
  { id: 'toggle-sidebars',    key: 'dfm_active',        cls: 'dfm-active'        },
  { id: 'toggle-bubble',      key: 'dfm_bubble',        cls: 'dfm-bubble'        },
  { id: 'toggle-hide-gif',    key: 'dfm_hide_gif',      cls: 'dfm-hide-gif'      },
  { id: 'toggle-hide-sticker',key: 'dfm_hide_sticker',  cls: 'dfm-hide-sticker'  },
  { id: 'toggle-hide-gift',   key: 'dfm_hide_gift',     cls: 'dfm-hide-gift'     },
  { id: 'toggle-hide-apps',   key: 'dfm_hide_apps',     cls: 'dfm-hide-apps'     },
];

const keys = FEATURES.map(f => f.key);

// Load all states and set checkboxes
chrome.storage.local.get(keys, (result) => {
  FEATURES.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!result[key];
  });
});

// Wire each toggle
FEATURES.forEach(({ id, key, cls }) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('change', () => {
    const active = el.checked;
    chrome.storage.local.set({ [key]: active });

    chrome.tabs.query({ url: '*://discord.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: 'setClass', cls, active });
      });
    });
  });
});
