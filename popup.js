const FEATURES = [
  { id: 'toggle-sidebars',     key: 'dfm_show_sidebars' },
  { id: 'toggle-hide-gif',     key: 'dfm_show_gif'      },
  { id: 'toggle-hide-sticker', key: 'dfm_show_sticker'  },
  { id: 'toggle-hide-gift',    key: 'dfm_show_gift'     },
  { id: 'toggle-hide-apps',    key: 'dfm_show_apps'     },
];

const DEFAULTS = {
  dfm_show_sidebars: true,
  dfm_show_gif:      true,
  dfm_show_sticker:  true,
  dfm_show_gift:     true,
  dfm_show_apps:     true,
};

// Load saved state — default to true (visible) if never set
chrome.storage.local.get(FEATURES.map(f => f.key), (result) => {
  FEATURES.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = key in result ? !!result[key] : DEFAULTS[key];
  });
});

// Each toggle writes to storage — content.js picks it up via onChanged
FEATURES.forEach(({ id, key }) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', () => {
    chrome.storage.local.set({ [key]: el.checked });
  });
});
