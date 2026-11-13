importScripts("common.js");

// Unlocks are per domain and shared by every tab:
//   chrome.storage.session  "unlock:<domain>" -> expiry timestamp (ms)
//   chrome.alarms           "unlock:<domain>" fires at expiry and re-locks open tabs
//   chrome.alarms           "badge-tick" refreshes the minutes-left badge while anything is unlocked
const UNLOCK = "unlock:";
const TICK = "badge-tick";

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
chrome.action.setBadgeBackgroundColor({ color: "#4F7A65" });
if (chrome.action.setBadgeTextColor) chrome.action.setBadgeTextColor({ color: "#FFFFFF" });

function gateUrl(url, domain, expired) {
  return chrome.runtime.getURL("gate.html") +
    `?url=${encodeURIComponent(url)}&domain=${encodeURIComponent(domain)}` +
    (expired ? "&expired=1" : "");
}

// Active unlocks as { domain: until }, dropping expired ones.
async function getUnlocks() {
  const all = await chrome.storage.session.get(null);
  const now = Date.now();
  const unlocks = {};
  const stale = [];
  for (const [key, until] of Object.entries(all)) {
    if (!key.startsWith(UNLOCK)) continue;
    if (until > now) unlocks[key.slice(UNLOCK.length)] = until;
    else stale.push(key);
  }
  if (stale.length) await chrome.storage.session.remove(stale);
  return unlocks;
}

async function unlock(domain) {
  const { allowMinutes: minutes } = await getSettings();
  const until = Date.now() + minutes * 60 * 1000;
  await chrome.storage.session.set({ [UNLOCK + domain]: until });
  await chrome.alarms.create(UNLOCK + domain, { when: until });
  await chrome.alarms.create(TICK, { periodInMinutes: 1 });
  await refreshBadges();
}

// Time's up: forget the unlock and send every open tab on that domain back to the gate.
async function relock(domain) {
  await chrome.storage.session.remove(UNLOCK + domain);
  const tabs = await chrome.tabs.query({ url: [`*://${domain}/*`, `*://*.${domain}/*`] });
  await Promise.all(tabs.map(tab => chrome.tabs.update(tab.id, { url: gateUrl(tab.url, domain, true) })));
  await refreshBadges();
}

// Per-tab badge with the minutes left, only on tabs of an unlocked domain.
async function refreshBadges() {
  const unlocks = await getUnlocks();
  const domains = Object.keys(unlocks);
  if (!domains.length) await chrome.alarms.clear(TICK);
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map(tab => {
    let text = "";
    try {
      const host = new URL(tab.url).hostname;
      const d = /^https?:/.test(tab.url) && matchDomain(host, domains);
      if (d) text = Math.max(1, Math.ceil((unlocks[d] - Date.now()) / 60000)) + "m";
    } catch { /* tab without a URL */ }
    return chrome.action.setBadgeText({ tabId: tab.id, text }).catch(() => {});
  }));
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  let url;
  try { url = new URL(details.url); } catch { return; }
  if (!/^https?:$/.test(url.protocol)) return;

  const { domains } = await getSettings();
  const domain = matchDomain(url.hostname, domains);
  if (!domain) return;
  const unlocks = await getUnlocks();
  if (unlocks[domain]) return;

  chrome.tabs.update(details.tabId, { url: gateUrl(details.url, domain, false) });
});

// The gate asks for an unlock once the user has confirmed every step.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "unlock" && typeof msg.domain === "string" && sender.id === chrome.runtime.id) {
    unlock(msg.domain).then(() => sendResponse({ ok: true }));
    return true; // async response
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TICK) refreshBadges();
  else if (alarm.name.startsWith(UNLOCK)) relock(alarm.name.slice(UNLOCK.length));
});

// Keep the badge right as tabs navigate.
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.url || info.status === "complete") refreshBadges();
});

// Unlocks live in session storage, so they're gone after a browser restart: drop leftover alarms too.
chrome.runtime.onStartup.addListener(async () => {
  const alarms = await chrome.alarms.getAll();
  await Promise.all(alarms.filter(a => a.name.startsWith(UNLOCK) || a.name === TICK).map(a => chrome.alarms.clear(a.name)));
});
