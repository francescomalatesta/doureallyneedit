const $ = (id) => document.getElementById(id);

const LIMITS = {
  confirmations: [1, 4],
  waitSeconds: [0, 60],
  allowMinutes: [5, 240]
};

// Per-style copy and value formatting
const TEXT = {
  breathe: {
    title: "doureallyneedit", subtitle: "The places you'd like to pause before entering.",
    sites: "Sites", add: "Add", placeholder: "add a site, e.g. news.ycombinator.com",
    subdomains: "Subdomains are included automatically.", statsTitle: "Your pauses",
    behavior: "How gentle?", style: "Style", confirmations: "Times to ask",
    waitSeconds: "Wait before the last yes", allowMinutes: "Then unlock for",
    askReason: "Ask me to write a reason", save: "Save", saved: "Saved. Breathe easy.",
    remove: "×", empty: "No pauses yet.",
    fmt: { confirmations: (v) => v, waitSeconds: (v) => `${v} s`, allowMinutes: (v) => `${v} min` },
    stat: (a, e) => `${a} walked away · ${e} went in`
  },
  terminal: {
    title: "doureallyneedit --config", subtitle: "one domain per line, subdomains included",
    sites: "[sites]", add: "o", placeholder: "news.ycombinator.com",
    subdomains: "# matches subdomains too", statsTitle: "$ doureallyneedit stats",
    behavior: "[behavior]", style: "style", confirmations: "confirmations",
    waitSeconds: "final_wait_s", allowMinutes: "unlock_min",
    askReason: "ask_reason", save: ":wq save", saved: "written.",
    remove: "dd", empty: "(no data)",
    fmt: { confirmations: (v) => v, waitSeconds: (v) => v, allowMinutes: (v) => v },
    stat: (a, e) => `avoided=${a} entered=${e}`
  },
  arcade: {
    title: "OPTIONS", subtitle: "PRESS SAVE GAME WHEN READY",
    sites: "BOSS LIST", add: "ADD", placeholder: "NEW BOSS...",
    subdomains: "SUBDOMAINS INCLUDED", statsTitle: "HIGH SCORES · AVOIDED / ENTERED",
    behavior: "SETTINGS", style: "SKIN", confirmations: "LIVES",
    waitSeconds: "WAIT", allowMinutes: "PLAYTIME",
    askReason: "REASON", save: "SAVE GAME", saved: "GAME SAVED!",
    remove: "DEL", empty: "NO SCORES YET",
    fmt: { confirmations: (v) => v, waitSeconds: (v) => `${v}S`, allowMinutes: (v) => `${v}M` },
    stat: (a, e) => `${a} / ${e}`
  }
};

let state;     // working copy of the settings
let stats = {};
let starsMade = false;

async function load() {
  state = await getSettings();
  ({ stats = {} } = await chrome.storage.local.get("stats"));
  render();
  document.body.classList.add("ready");
}

function t() { return TEXT[state.style]; }

function render() {
  const tx = t();
  applyTheme(state.style);
  if (state.style === "arcade" && !starsMade) { makeStars($("stars"), 24); starsMade = true; }

  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = tx[el.dataset.t]; });
  $("addInput").placeholder = tx.placeholder;

  // Domains
  $("domainList").replaceChildren(...state.domains.map(d => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = d;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tx.remove;
    btn.setAttribute("aria-label", `Remove ${d}`);
    btn.onclick = () => { state.domains = state.domains.filter(x => x !== d); dirty(); };
    li.append(name, btn);
    return li;
  }));

  // Numbers, toggle, style
  document.querySelectorAll(".stepper button").forEach(b => {
    const up = Number(b.dataset.delta) > 0;
    b.textContent = state.style === "arcade" ? (up ? "▶" : "◀") : (up ? "+" : "−");
  });
  for (const key of Object.keys(LIMITS)) $("out-" + key).textContent = tx.fmt[key](state[key]);
  $("askReason").setAttribute("aria-pressed", String(state.askReason));
  document.querySelectorAll("#styleSeg button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.style === state.style)));

  // Stats
  const rows = Object.entries(stats)
    .sort((a, b) => (b[1].avoided + b[1].entered) - (a[1].avoided + a[1].entered));
  $("stats").replaceChildren(...(rows.length ? rows.map(([d, v]) => {
    const row = document.createElement("div");
    const a = document.createElement("span"); a.textContent = d;
    const b = document.createElement("span"); b.textContent = tx.stat(v.avoided, v.entered);
    row.append(a, b);
    return row;
  }) : [Object.assign(document.createElement("div"), { textContent: tx.empty })]));
}

function dirty() {
  $("saved").hidden = true;
  $("termStatus").textContent = "[+] modified";
  render();
}

document.querySelectorAll(".stepper button").forEach(btn => {
  btn.onclick = () => {
    const key = btn.dataset.key;
    const [min, max] = LIMITS[key];
    state[key] = Math.min(max, Math.max(min, state[key] + Number(btn.dataset.delta)));
    dirty();
  };
});

$("askReason").onclick = () => { state.askReason = !state.askReason; dirty(); };

document.querySelectorAll("#styleSeg button").forEach(btn => {
  btn.onclick = () => { state.style = btn.dataset.style; dirty(); };
});

$("addForm").onsubmit = (e) => {
  e.preventDefault();
  const d = normalizeDomain($("addInput").value);
  if (d && !state.domains.includes(d)) state.domains.push(d);
  $("addInput").value = "";
  dirty();
};

$("save").onclick = async () => {
  await chrome.storage.sync.set({
    domains: state.domains,
    confirmations: state.confirmations,
    waitSeconds: state.waitSeconds,
    allowMinutes: state.allowMinutes,
    askReason: state.askReason,
    style: state.style
  });
  $("saved").hidden = false;
  $("termStatus").textContent = `"doureallyneedit.conf" written`;
};

load();
