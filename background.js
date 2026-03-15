/**
 * Discord Focus Mode - background.js (service worker)
 * Handles toolbar icon clicks and forwards to content script.
 */

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('discord.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});
