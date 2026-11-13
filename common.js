// Shared settings and helpers
const DEFAULTS = {
  domains: ["youtube.com", "reddit.com", "x.com", "facebook.com", "instagram.com"],
  confirmations: 2,      // how many times to ask for confirmation
  waitSeconds: 5,        // countdown before the last confirmation can be clicked
  allowMinutes: 15,      // how long the site stays unlocked after confirming
  askReason: true        // ask the user to type a reason
};

async function getSettings() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...s };
}

function normalizeDomain(d) {
  return d.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function matchDomain(hostname, domains) {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return domains.find(d => h === d || h.endsWith("." + d)) || null;
}
