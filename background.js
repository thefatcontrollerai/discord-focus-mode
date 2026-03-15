/**
 * Discord Focus Mode - background.js (service worker)
 * On install/update: inject content script into any already-open Discord tabs
 * so the user doesn't need to manually refresh.
 */

// Inject into existing Discord tabs when extension installs or updates
chrome.runtime.onInstalled.addListener(injectIntoDiscordTabs);
chrome.runtime.onStartup.addListener(injectIntoDiscordTabs);

function injectIntoDiscordTabs() {
  chrome.tabs.query({ url: '*://discord.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      }).catch(() => {
        // Tab may not be injectable (e.g. discordapp.com login page) — ignore
      });

      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['styles.css'],
      }).catch(() => {});
    });
  });
}
