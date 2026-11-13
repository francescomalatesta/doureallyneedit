# Chrome Web Store — listing kit

Everything needed to fill in the Developer Dashboard, ready to copy and paste.
The package to upload is the zip from the latest [GitHub release](https://github.com/francescomalatesta/doureallyneedit/releases/latest).

---

## Package

- **Upload:** `doureallyneedit-vX.Y.Z-build.N.zip` from the latest release
- **Name** (from manifest): `doureallyneedit`
- **Summary** (from manifest, 102/132 chars):
  > Pause before opening distracting sites: a short, mindful check asks if you really need them right now.

---

## Store listing tab

**Category:** Productivity → Workflow & Planning
**Language:** English

**Description:**

```
doureallyneedit shows a short confirmation page before you open the websites you visit out of habit, and asks one simple question: do you really need this right now?

WHY INSTALL IT
Most time lost online doesn't start with a decision. It starts with muscle memory: a new tab, a few typed letters, and twenty minutes are gone. Blockers try to fix this by locking you out, and most people end up switching them off. doureallyneedit takes a gentler approach. It doesn't block anything. It turns an automatic click into a conscious choice. Sometimes the answer is yes, and that's fine. Often you'll find you didn't need it after all.

WHAT IT DOES
• You choose which sites to pause on (subdomains are included automatically).
• When you open one of them, a calm confirmation page appears first, with a question picked at random from a pool of 30.
• Confirm, and the site opens and stays unlocked for as long as you decide, in every tab. The extension icon shows the minutes left.
• When time is up, every open tab on that site is locked again.
• Say no at any step, and you're taken somewhere quieter. Every time you walk away is counted in your stats.

AS GENTLE OR AS FIRM AS YOU WANT
• Ask once, or up to 4 times, with a different question each time
• Optional countdown before the last "yes" becomes clickable
• Optional "why?" step: write a few words about what you need to do there
• Choose how long a site stays unlocked after you confirm
• See, for each site, how often you walked away and how often you went in

THREE STYLES TO CHOOSE FROM
• Breathe (default): calm and slow, with a breathing orb
• Terminal: a green phosphor screen with a blinking [y/N] prompt
• Arcade: a retro game screen with hi-scores and a CONTINUE? countdown

PRIVATE BY DESIGN
• No accounts, no analytics, no tracking, no ads
• Nothing leaves your browser: no network requests, fonts included
• Your settings sync across your own Chrome browsers; your stats stay on this device
• Open source: https://github.com/francescomalatesta/doureallyneedit

A note on permissions: Chrome will say the extension can "read your browsing history". It needs this to notice when you open a site on your list. Addresses are checked against your list inside your browser and are never stored or sent anywhere.
```

**Graphic assets** (all in this folder):

| Field | File |
|---|---|
| Store icon (128×128) | `../icons/icon-128.png` |
| Screenshots (1280×800, in this order) | `screenshots/1-breathe.png`, `screenshots/2-terminal.png`, `screenshots/3-arcade.png`, `screenshots/4-reason.png`, `screenshots/5-settings.png` |
| Small promo tile (440×280) | `promo-small-440x280.png` |
| Marquee promo tile (1400×560, optional) | `promo-marquee-1400x560.png` |

**Additional fields:**
- **Homepage URL:** `https://github.com/francescomalatesta/doureallyneedit`
- **Support URL:** `https://github.com/francescomalatesta/doureallyneedit/issues`
- **Mature content:** No

---

## Privacy practices tab

**Single purpose description:**

```
Shows a confirmation page before the user opens websites they have added to a personal list, asking whether they really need to visit them, to reduce habitual, distracted browsing.
```

**Permission justification — `storage`:**

```
Used to save the user's settings (list of domains, number of confirmations, wait time, unlock duration, visual style) with chrome.storage.sync, per-domain counters of how many times the user walked away or went in with chrome.storage.local, and short-lived per-domain unlocks (domain and expiry time) with chrome.storage.session. No data leaves the browser.
```

**Permission justification — `webNavigation`:**

```
Used to detect when the user navigates (main frame only) to a domain on their personal list, so the extension can show its confirmation page before the site loads. The URL is compared with the list locally and is never stored, logged or transmitted.
```

**Permission justification — `tabs`:**

```
Used for two user-facing features. When the unlock time the user chose for a site is over, the extension finds the open tabs on that domain (chrome.tabs.query) and sends them back to its confirmation page. While a site is unlocked, it shows the minutes left as a badge on the extension icon in that site's tabs. Tab URLs are only compared with the user's list locally and are never stored, logged or transmitted.
```

**Permission justification — `alarms`:**

```
Used to schedule the end of an unlock (one alarm per unlocked domain, at the expiry time chosen by the user) so open tabs can be locked again on time, and to refresh the minutes-left badge once a minute while a site is unlocked.
```

**Are you using remote code?** No, I am not using remote code.

**Data usage — what user data do you collect?**
Recommended: tick **nothing**. The extension does not collect or transmit any user data. It only keeps the user's own settings and per-domain counters inside the browser (see the privacy policy).
If you'd rather be conservative, you can tick **Web history**. Your call.

**Certifications** (tick all three):
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:**

```
https://github.com/francescomalatesta/doureallyneedit/blob/main/PRIVACY.md
```

---

## Test instructions tab (optional, helps reviewers)

```
No account or setup needed.
1. Install the extension. To see the re-lock without waiting 15 minutes, first click the extension icon to open the settings, set "Then unlock for" to 5 min and click Save.
2. Open https://www.instagram.com (on the default list). A confirmation page appears instead. Click "Yes, I need it", type at least three words in the "why?" box and click "Yes, let me in": Instagram opens, and the extension icon shows the minutes left.
3. Open Instagram in a second tab: it opens directly, without asking again.
4. When the unlock time is over, both Instagram tabs go back to the confirmation page with a "Time's up" note.
5. On that page click "No, never mind": you are taken to google.com.
6. In the settings you can also add or remove sites and change confirmations, wait time, the "reason" step and the visual style.
```

---

## Distribution tab

- **Payments:** Free
- **Visibility:** Public, or Unlisted if you want a soft launch first
- **Regions:** All regions
