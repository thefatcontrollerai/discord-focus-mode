# Discord Focus Mode

Chrome extension that hides Discord's sidebars for a full-width chat terminal.

## What it does

- Hides the **servers list** (left column) and **channels list** (second column)
- Chat pane expands to full width
- State persists across page reloads

## How to use

| Action | Trigger |
|---|---|
| Toggle on/off | `Alt+H` keyboard shortcut |
| Toggle on/off | Click the extension toolbar icon |
| Toggle on/off | Click the small `⬡ Focus` button (top-left of Discord) |

## Install (unpacked / developer mode)

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this folder: `discord-focus-mode/`
5. Go to `discord.com` and press `Alt+H`

## Notes

- Only works on **discord.com** in the browser (not the desktop app)
- Discord occasionally updates their CSS class names which can break selectors — check `styles.css` if sidebars stop hiding
- The small toggle button sits top-left and fades unless you're in focus mode

## File structure

```
manifest.json     — Extension config (Manifest V3)
content.js        — Main logic, injected into discord.com
background.js     — Service worker, handles toolbar icon click
styles.css        — CSS to hide sidebars and expand chat
icon*.png         — Extension icons
```
