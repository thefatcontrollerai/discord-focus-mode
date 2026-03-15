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

  // Icon: three panels (sidebars visible) — shown when focus mode is OFF
  // Matches Discord's icon style: ~20px, #b5bac1 grey
  ICON_OFF: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="9" y1="4" x2="9" y2="20" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke="#b5bac1" stroke-width="1.5"/>
  </svg>`,

  // Icon: single panel (focus mode ON) — white, middle panel highlighted
  ICON_ON: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="9" y1="4" x2="9" y2="20" stroke="#b5bac1" stroke-width="1.5" opacity="0.3"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke="#b5bac1" stroke-width="1.5" opacity="0.3"/>
    <rect x="10" y="4" width="4" height="16" fill="#b5bac1" fill-opacity="0.3"/>
    <line x1="12" y1="9" x2="12" y2="15" stroke="#b5bac1" stroke-width="2" stroke-linecap="round"/>
    <polyline points="9,12 12,9 15,12" stroke="#b5bac1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,

  injectButton() {
    if (document.getElementById(this.BTN_ID)) return;

    // Strategy: find the known "Download Apps" or "Help" button in the title bar
    // and insert our button directly before it — this is the most stable anchor point.
    const anchor =
      document.querySelector('[aria-label="Download Apps"]')
      || document.querySelector('[aria-label="Help"]')
      || document.querySelector('[aria-label="Download Desktop App"]');

    if (anchor) {
      const btn = this.createButton();
      // Insert before the anchor (leftmost of the two icons)
      const firstIcon = anchor.closest('[class*="titleBar"] [class*="toolbar"]')
        ? anchor.parentElement.firstChild
        : anchor;
      anchor.parentElement.insertBefore(btn, firstIcon);
      return;
    }

    // Fallback: insert into the title bar itself
    const titleBar = document.querySelector('[class*="titleBar"]');
    if (!titleBar) return;

    const btn = this.createButton();
    titleBar.appendChild(btn);
  },

  createButton() {
    const btn = document.createElement('button');
    btn.id = this.BTN_ID;
    btn.title = 'Toggle focus mode (Alt+H)';
    btn.innerHTML = this.isActive ? this.ICON_ON : this.ICON_OFF;
    btn.addEventListener('click', () => this.toggle());
    return btn;
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
