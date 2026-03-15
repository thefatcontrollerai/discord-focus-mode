/**
 * Discord Focus Mode - content.js
 * Injects a <style> tag into document.body (same technique as Multarix's working script).
 * Each feature toggle just rebuilds that style tag — no class manipulation, no querySelector timing issues.
 */

const STORAGE_KEYS = [
  'dfm_show_sidebars',
  'dfm_show_gif',
  'dfm_show_sticker',
  'dfm_show_gift',
  'dfm_show_apps',
  'dfm_show_emoji',
];

const DEFAULTS = {
  dfm_show_sidebars: true,
  dfm_show_gif:      true,
  dfm_show_sticker:  true,
  dfm_show_gift:     true,
  dfm_show_apps:     true,
  dfm_show_emoji:    true,
};

const STYLE_ID = 'dfm-injected-styles';

let state = {};

// ── CSS blocks per feature ───────────────────────────────────────

function get(s, key) {
  return key in s ? s[key] : DEFAULTS[key];
}

function buildCSS(s) {
  let css = '';

  // Sidebar + main content — always set transitions so both directions animate smoothly
  css += `
    nav[aria-label*="Servers sidebar"],
    nav[class*="guilds"],
    nav[class*="wrapper-"],
    div[class*="sidebarList"],
    div[class*="sidebar_"] {
      transition: width 0.25s ease, min-width 0.25s ease, opacity 0.25s ease !important;
      overflow: hidden !important;
      opacity: 1 !important;
    }
    [class*="chatContent"],
    [class*="content_"],
    [class*="chat_"] {
      transition: flex 0.25s ease, width 0.25s ease !important;
    }
  `;

  // Sidebar — hide when toggled off
  if (!get(s, 'dfm_show_sidebars')) {
    css += `
      nav[aria-label*="Servers sidebar"],
      nav[class*="guilds"],
      nav[class*="wrapper-"],
      div[class*="sidebarList"],
      div[class*="sidebar_"] {
        width: 0 !important;
        min-width: 0 !important;
        opacity: 0 !important;
      }
    `;
  }

  // Chat bar buttons — hide when toggled off
  if (!get(s, 'dfm_show_gif'))     css += `[aria-label="Open GIF picker"] { display: none !important; }`;
  if (!get(s, 'dfm_show_sticker')) css += `[aria-label="Open sticker picker"] { display: none !important; }`;
  if (!get(s, 'dfm_show_gift'))    css += `[aria-label="Send a gift"] { display: none !important; } [aria-label="Give a Gift"] { display: none !important; }`;
  if (!get(s, 'dfm_show_apps'))    css += `[aria-label="Apps"] { display: none !important; }`;
  if (!get(s, 'dfm_show_emoji'))   css += `[aria-label="Select emoji"] { display: none !important; } [aria-label="Open emoji picker"] { display: none !important; }`;

  return css;
}

// ── Apply / remove the injected style tag ───────────────────────

function applyStyles() {
  let tag = document.getElementById(STYLE_ID);
  if (!tag) {
    tag = document.createElement('style');
    tag.id = STYLE_ID;
    document.body.appendChild(tag);
  }
  tag.innerHTML = buildCSS(state);
}

// ── Init ────────────────────────────────────────────────────────

function init() {
  // Apply defaults for any keys not yet set in storage
  chrome.storage.local.get(STORAGE_KEYS, (result) => {
    state = { ...DEFAULTS, ...result };
    applyStyles();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    let changed = false;
    Object.entries(changes).forEach(([key, { newValue }]) => {
      if (STORAGE_KEYS.includes(key)) {
        state[key] = newValue;
        changed = true;
      }
    });
    if (changed) applyStyles();
  });

}

// ── Wait for Discord SPA to mount ───────────────────────────────

function waitForDiscord() {
  if (document.body) {
    init();
  } else {
    setTimeout(waitForDiscord, 100);
  }
}

waitForDiscord();
