const STORAGE_KEY = 'dfm_active';
const toggle = document.getElementById('toggle');

// Load current state and reflect in toggle
chrome.storage.local.get([STORAGE_KEY], (result) => {
  toggle.checked = !!result[STORAGE_KEY];
});

// On toggle change, update storage and tell the active Discord tab
toggle.addEventListener('change', () => {
  const active = toggle.checked;
  chrome.storage.local.set({ [STORAGE_KEY]: active });

  // Send message to Discord tab
  chrome.tabs.query({ url: '*://discord.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    });
  });
});
