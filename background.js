importScripts("common.js");

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

// Temporary unlocks: key "tabId|domain" -> expiry timestamp (ms)
async function isAllowed(tabId, domain) {
  const key = `${tabId}|${domain}`;
  const { [key]: until } = await chrome.storage.session.get(key);
  return until && until > Date.now();
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  let url;
  try { url = new URL(details.url); } catch { return; }
  if (!/^https?:$/.test(url.protocol)) return;

  const { domains } = await getSettings();
  const domain = matchDomain(url.hostname, domains);
  if (!domain) return;
  if (await isAllowed(details.tabId, domain)) return;

  const gate = chrome.runtime.getURL("gate.html") +
    `?url=${encodeURIComponent(details.url)}&domain=${encodeURIComponent(domain)}`;
  chrome.tabs.update(details.tabId, { url: gate });
});

// Clean up unlocks when a tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const all = await chrome.storage.session.get(null);
  const keys = Object.keys(all).filter(k => k.startsWith(tabId + "|"));
  if (keys.length) chrome.storage.session.remove(keys);
});
