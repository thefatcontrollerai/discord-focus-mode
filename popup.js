const FEATURES = [
  { id: 'toggle-sidebars',     key: 'dfm_active'       },
  { id: 'toggle-bubble',       key: 'dfm_bubble'       },
  { id: 'toggle-hide-gif',     key: 'dfm_hide_gif'     },
  { id: 'toggle-hide-sticker', key: 'dfm_hide_sticker' },
  { id: 'toggle-hide-gift',    key: 'dfm_hide_gift'    },
  { id: 'toggle-hide-apps',    key: 'dfm_hide_apps'    },
];

// Load saved state into checkboxes
chrome.storage.local.get(FEATURES.map(f => f.key), (result) => {
  FEATURES.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!result[key];
  });
});

// Each toggle just writes to storage — content.js picks it up via onChanged
FEATURES.forEach(({ id, key }) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', () => {
    chrome.storage.local.set({ [key]: el.checked });
  });
});
