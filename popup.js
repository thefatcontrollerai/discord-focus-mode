const STORAGE_KEY = 'dfm_active';
const toggle = document.getElementById('toggle');

// Load current state
chrome.storage.local.get([STORAGE_KEY], (result) => {
  toggle.checked = !!result[STORAGE_KEY];
});

// On toggle: write storage first, then send explicit state to Discord tab
toggle.addEventListener('change', () => {
  const active = toggle.checked;
  chrome.storage.local.set({ [STORAGE_KEY]: active });

  chrome.tabs.query({ url: '*://discord.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'setState', active });
    });
  });
});
