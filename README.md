# doureallyneedit

A tiny Chrome extension (Manifest V3) that stops you from opening distracting websites on autopilot.

When you navigate to a domain on your list, you land on an interstitial page that asks whether you **really** need to go there — a configurable number of times — before letting you in.

## Features

- Configurable list of domains (subdomains are matched automatically)
- 1–4 confirmation steps
- Optional "type your reason" step
- Countdown before the final confirmation
- Temporary unlock per tab (default 15 minutes)
- Per-domain stats: how many times you walked away vs. went in
- No network requests, no tracking: everything stays in Chrome storage

## Install (unpacked)

1. Clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the repo folder

Click the extension icon to open the settings.
