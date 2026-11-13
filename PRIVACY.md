# Privacy Policy — doureallyneedit

_Last updated: November 13, 2026_

doureallyneedit is a Chrome extension that shows a short confirmation page before you open websites you have chosen to pause on. This policy explains what data the extension handles and what happens to it.

## The short version

- **Nothing leaves your browser.** The extension makes no network requests to any server, and has no analytics, tracking, ads or third-party services. The only navigation it triggers is taking you to the site you confirmed, or to google.com when you choose "No".
- **We don't collect, sell or share any data.** The developer has no way to see your settings, your list of sites or your stats.

## What the extension handles, and where it stays

| Data | Why | Where it's stored |
|---|---|---|
| **Your settings**: the list of domains to pause on, number of confirmations, wait time, unlock time, "ask for a reason" option, visual style | To work the way you configured it | `chrome.storage.sync`, which Chrome syncs across your own signed-in Chrome browsers. Google handles this under its own privacy policy. |
| **Per-site counters**: for each domain on your list, how many times you walked away and how many times you went in | To show you your stats | `chrome.storage.local`, on this device only |
| **Temporary unlocks**: which tab is allowed to open which listed domain, and until when | So you aren't asked again right after confirming | `chrome.storage.session`, in memory only, cleared when the browser closes or the tab is closed |

**Navigation events.** To know when you are opening a site on your list, the extension uses Chrome's `webNavigation` permission and compares each page's domain with your list, inside your browser. URLs of the sites you visit are **not** stored, logged or sent anywhere. Only the per-domain counters above are kept, and only for the domains you added yourself.

**The "reason" text.** When the extension asks you to type why you need a site, that text is used only to check that you wrote at least three words. It is never saved.

## Permissions

- `storage`: to save your settings and counters, as described above.
- `webNavigation`: to notice when you navigate to a domain on your list, so the confirmation page can be shown.

## Your control

- You can edit or remove any listed site at any time from the extension's settings page.
- Uninstalling the extension removes all of its locally stored data.

## Changes

If this policy changes, the updated version will be published at this address, with a new "Last updated" date.

## Contact

Questions or concerns: open an issue at <https://github.com/francescomalatesta/doureallyneedit/issues>.
