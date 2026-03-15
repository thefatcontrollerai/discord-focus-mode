/**
 * Discord Focus Mode - content.js
 * Toggles full-width chat by hiding both sidebars.
 * Trigger: Alt+H keyboard shortcut OR toolbar button click via background.js message.
 */

const DFM = {
  STORAGE_KEY: 'dfm_active',
  BTN_ID: 'dfm-toggle-btn',
  ACTIVE_CLASS: 'dfm-active',

  get isActive() {
    return document.body.classList.contains(this.ACTIVE_CLASS);
  },

  init() {
    // Restore state from storage
    chrome.storage.local.get([this.STORAGE_KEY], (result) => {
      if (result[this.STORAGE_KEY]) {
        this.enable(false);
      }
      this.injectButton();
    });

    // Keyboard shortcut: Alt+H
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Listen for toolbar icon click from background.js
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'toggle') {
        this.toggle();
      }
    });
  },

  // Icon: two panels (sidebars visible) — shown when focus mode is OFF
  ICON_OFF: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="#b5bac1" stroke-width="1.8"/>
    <line x1="8" y1="3" x2="8" y2="21" stroke="#b5bac1" stroke-width="1.8"/>
    <line x1="16" y1="3" x2="16" y2="21" stroke="#b5bac1" stroke-width="1.8"/>
  </svg>`,

  // Icon: single panel (focus mode ON) — filled/highlighted
  ICON_ON: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="#ffffff" stroke-width="1.8"/>
    <line x1="8" y1="3" x2="8" y2="21" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="2 2"/>
    <line x1="16" y1="3" x2="16" y2="21" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="2 2"/>
    <rect x="9" y="4" width="6" height="16" fill="#ffffff" fill-opacity="0.15"/>
  </svg>`,

  injectButton() {
    if (document.getElementById(this.BTN_ID)) return;

    // Find Discord's toolbar — the row of icons top-right of the channel header
    const toolbar = document.querySelector('[class*="toolbar-"]')
      || document.querySelector('[class*="titleBar-"]')
      || document.querySelector('section[aria-label*="Channel header"]');

    if (!toolbar) return; // not ready yet, waitForDiscord will retry

    const btn = document.createElement('button');
    btn.id = this.BTN_ID;
    btn.title = 'Toggle focus mode (Alt+H)';
    btn.innerHTML = this.isActive ? this.ICON_ON : this.ICON_OFF;
    btn.addEventListener('click', () => this.toggle());

    // Insert as the first child so it sits at the left of the toolbar icons
    toolbar.insertBefore(btn, toolbar.firstChild);
  },

  toggle() {
    this.isActive ? this.disable() : this.enable();
  },

  enable(persist = true) {
    document.body.classList.add(this.ACTIVE_CLASS);
    const btn = document.getElementById(this.BTN_ID);
    if (btn) btn.innerHTML = this.ICON_ON;
    if (persist) chrome.storage.local.set({ [this.STORAGE_KEY]: true });
  },

  disable(persist = true) {
    document.body.classList.remove(this.ACTIVE_CLASS);
    const btn = document.getElementById(this.BTN_ID);
    if (btn) btn.innerHTML = this.ICON_OFF;
    if (persist) chrome.storage.local.set({ [this.STORAGE_KEY]: false });
  }
};

// Discord is a SPA — wait for the app shell to render before injecting
function waitForDiscord() {
  const ready = document.querySelector('nav[aria-label*="Servers"]')
    || document.querySelector('nav[class*="guilds"]')
    || document.querySelector('div[class*="sidebarList"]');

  if (ready) {
    DFM.init();
  } else {
    setTimeout(waitForDiscord, 300);
  }
}

waitForDiscord();
