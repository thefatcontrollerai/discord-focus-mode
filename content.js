/**
 * Discord Focus Mode - content.js
 * Uses chrome.storage as source of truth.
 * Sidebar: CSS class on body (fast, CSS handles animation).
 * Everything else: JS DOM manipulation + MutationObserver (resilient to obfuscated classes).
 */

const STORAGE_KEYS = [
  'dfm_active',
  'dfm_bubble',
  'dfm_hide_gif',
  'dfm_hide_sticker',
  'dfm_hide_gift',
  'dfm_hide_apps',
];

let state = {};

// ── Selectors ──────────────────────────────────────────────────

// Buttons: try multiple known aria-labels per feature (Discord changes these)
const BUTTON_SELECTORS = {
  dfm_hide_gif:     ['Open GIF picker', 'GIF'],
  dfm_hide_sticker: ['Open Sticker Picker', 'Open sticker picker', 'Sticker', 'Stickers'],
  dfm_hide_gift:    ['Send a gift', 'Gift', 'Nitro Gift'],
  dfm_hide_apps:    ['Use Apps', 'Apps', 'Open Apps'],
};

// ── Apply state ─────────────────────────────────────────────────

function applyState() {
  // Sidebar: body class (CSS handles the animation)
  document.body.classList.toggle('dfm-active', !!state.dfm_active);

  // Bubble bar: find textarea and apply border-radius via JS
  applyBubbleBar();

  // Button visibility
  Object.entries(BUTTON_SELECTORS).forEach(([key, labels]) => {
    const hide = !!state[key];
    labels.forEach(label => {
      document.querySelectorAll(`button[aria-label="${label}"]`).forEach(btn => {
        btn.style.display = hide ? 'none' : '';
      });
    });
  });
}

function applyBubbleBar() {
  const bubble = !!state.dfm_bubble;
  const r = bubble ? '24px' : '';

  // Find the chat input area — look for the contenteditable div's wrapper
  // Discord wraps it in a div with role="textbox" or with slate classes
  const chatArea = document.querySelector('[class*="channelTextArea"]');
  if (chatArea) {
    // Inner text box
    const inner = chatArea.querySelector('[class*="textArea"]');
    if (inner) inner.style.borderRadius = r;

    // Scrollable container
    const scroll = chatArea.querySelector('[class*="scrollableContainer"]');
    if (scroll) scroll.style.borderRadius = r;

    // Buttons next to bar
    chatArea.querySelectorAll('button').forEach(btn => {
      btn.style.borderRadius = bubble ? '50%' : '';
    });
  }
}

// ── Init ────────────────────────────────────────────────────────

function init() {
  // Load all state
  chrome.storage.local.get(STORAGE_KEYS, (result) => {
    state = result;
    applyState();
  });

  // React to popup changes instantly
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    let changed = false;
    Object.entries(changes).forEach(([key, { newValue }]) => {
      if (STORAGE_KEYS.includes(key)) {
        state[key] = newValue;
        changed = true;
      }
    });
    if (changed) applyState();
  });

  // Alt+H: toggle sidebar
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      chrome.storage.local.set({ dfm_active: !state.dfm_active });
    }
  });

  // MutationObserver: Discord re-renders buttons constantly, reapply on changes
  const observer = new MutationObserver(() => applyState());
  observer.observe(document.body, { childList: true, subtree: true });
}

// ── Wait for Discord SPA ────────────────────────────────────────

function waitForDiscord() {
  const ready =
    document.querySelector('[class*="chatContent"]') ||
    document.querySelector('[class*="channelTextArea"]') ||
    document.querySelector('nav[aria-label*="Servers"]') ||
    document.querySelector('div[class*="app-"]');

  if (ready) init();
  else setTimeout(waitForDiscord, 300);
}

waitForDiscord();
