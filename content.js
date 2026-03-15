/**
 * Discord Focus Mode - content.js
 * Injects a <style> tag into document.body (same technique as Multarix's working script).
 * Each feature toggle just rebuilds that style tag — no class manipulation, no querySelector timing issues.
 */

const STORAGE_KEYS = [
  'dfm_active',
  'dfm_hide_gif',
  'dfm_hide_sticker',
  'dfm_hide_gift',
  'dfm_hide_apps',
];

const STYLE_ID = 'dfm-injected-styles';

let state = {};

// ── CSS blocks per feature ───────────────────────────────────────

function buildCSS(s) {
  let css = '';

  // Sidebar hide
  if (s.dfm_active) {
    css += `
      nav[aria-label*="Servers sidebar"],
      nav[class*="guilds"],
      nav[class*="wrapper-"],
      div[class*="sidebarList"],
      div[class*="sidebar_"] {
        display: none !important;
      }
    `;
  }

  // Chat bar buttons — exact aria-labels from Multarix's working 2026 script
  if (s.dfm_hide_gif)     css += `[aria-label="Open GIF picker"] { display: none !important; }`;
  if (s.dfm_hide_sticker) css += `[aria-label="Open sticker picker"] { display: none !important; }`;
  if (s.dfm_hide_gift)    css += `[aria-label="Send a gift"] { display: none !important; } [aria-label="Give a Gift"] { display: none !important; }`;
  if (s.dfm_hide_apps)    css += `[aria-label="Apps"] { display: none !important; }`;

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
  chrome.storage.local.get(STORAGE_KEYS, (result) => {
    state = result;
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
