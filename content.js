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
    chrome.storage.local.get([this.STORAGE_KEY], (result) => {
      if (result[this.STORAGE_KEY]) {
        this.enable(false);
      }
    });

    // Keyboard shortcut: Alt+H
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Listen for explicit state from popup
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'setState') {
        msg.active ? this.enable(false) : this.disable(false);
      } else if (msg.action === 'toggle') {
        this.toggle();
      }
    });
  },

  // OFF: three-panel layout icon, muted grey (#b5bac1)
  ICON_OFF: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="9" y1="4" x2="9" y2="20" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke="#b5bac1" stroke-width="1.5"/>
  </svg>`,

  // ON: single panel, centre column highlighted
  ICON_ON: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#b5bac1" stroke-width="1.5"/>
    <line x1="9" y1="4" x2="9" y2="20" stroke="#b5bac1" stroke-width="1.5" opacity="0.3"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke="#b5bac1" stroke-width="1.5" opacity="0.3"/>
    <rect x="10" y="5" width="4" height="14" fill="#b5bac1" fill-opacity="0.4" rx="1"/>
  </svg>`,

  findTitleBarIconContainer() {
    // The title bar in Discord web is the black strip at the top containing
    // the server name + monitor icon + help icon on the right.
    // Class names are obfuscated but always contain "titleBar".
    const titleBar = document.querySelector('[class*="titleBar"]');
    if (!titleBar) return null;

    // Within the title bar, find the rightmost group of icon buttons.
    // Discord puts them in a flex container — find a button or div with role=button
    // that is NOT part of the left guild nav (exclude anything with guildsnav data attr).
    const allButtons = Array.from(titleBar.querySelectorAll('button, [role="button"]'));

    if (allButtons.length === 0) return null;

    // Return the parent of the first button found in the title bar
    return allButtons[0].parentElement;
  },

  injectButton() {
    if (document.getElementById(this.BTN_ID)) return;

    const container = this.findTitleBarIconContainer();
    if (!container) {
      console.log('[DFM] title bar container not found, will retry');
      return;
    }

    const btn = this.createButton();
    // Insert before the first child (leftmost icon in the group)
    container.insertBefore(btn, container.firstChild);
    console.log('[DFM] button injected into', container);
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
    document.body.classList.remove('dfm-collapsed');
    document.body.classList.add(this.ACTIVE_CLASS);
    // Collapse width after animation completes (350ms)
    this._collapseTimer = setTimeout(() => {
      document.body.classList.add('dfm-collapsed');
    }, 360);
    if (persist) chrome.storage.local.set({ [this.STORAGE_KEY]: true });
  },

  disable(persist = true) {
    clearTimeout(this._collapseTimer);
    // Restore width first so animation has space to play into
    document.body.classList.remove('dfm-collapsed');
    // Tiny delay to let the browser paint the restored width before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove(this.ACTIVE_CLASS);
      });
    });
    if (persist) chrome.storage.local.set({ [this.STORAGE_KEY]: false });
  }
};

// Discord is a SPA — wait for the app shell before initialising
function waitForDiscord() {
  const ready =
    document.querySelector('nav[aria-label*="Servers"]') ||
    document.querySelector('[class*="guilds"]') ||
    document.querySelector('[class*="sidebarList"]') ||
    document.querySelector('[class*="sidebar"]') ||
    document.querySelector('div[class*="app-"]');

  if (ready) {
    DFM.init();
  } else {
    setTimeout(waitForDiscord, 300);
  }
}

waitForDiscord();
