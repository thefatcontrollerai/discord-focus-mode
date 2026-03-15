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

  injectButton() {
    if (document.getElementById(this.BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = this.BTN_ID;
    btn.title = 'Toggle focus mode (Alt+H)';
    btn.textContent = this.isActive ? '⬡ Focus ON' : '⬡ Focus';
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
  },

  toggle() {
    this.isActive ? this.disable() : this.enable();
  },

  enable(persist = true) {
    document.body.classList.add(this.ACTIVE_CLASS);
    const btn = document.getElementById(this.BTN_ID);
    if (btn) btn.textContent = '⬡ Focus ON';
    if (persist) chrome.storage.local.set({ [this.STORAGE_KEY]: true });
  },

  disable(persist = true) {
    document.body.classList.remove(this.ACTIVE_CLASS);
    const btn = document.getElementById(this.BTN_ID);
    if (btn) btn.textContent = '⬡ Focus';
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
