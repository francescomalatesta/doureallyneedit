const $ = (id) => document.getElementById(id);

async function load() {
  const s = await getSettings();
  $("domains").value = s.domains.join("\n");
  $("confirmations").value = s.confirmations;
  $("waitSeconds").value = s.waitSeconds;
  $("allowMinutes").value = s.allowMinutes;
  $("askReason").checked = s.askReason;

  const { stats = {} } = await chrome.storage.local.get("stats");
  const rows = Object.entries(stats);
  if (rows.length) {
    $("stats").innerHTML = rows
      .sort((a, b) => (b[1].avoided + b[1].entered) - (a[1].avoided + a[1].entered))
      .map(([d, v]) => `<div><b>${d}</b>: ${v.avoided} avoided · ${v.entered} entered</div>`)
      .join("");
  }
}

$("save").onclick = async () => {
  const domains = [...new Set($("domains").value.split("\n").map(normalizeDomain).filter(Boolean))];
  const clamp = (v, min, max, def) => Math.min(max, Math.max(min, parseInt(v, 10) || def));
  await chrome.storage.sync.set({
    domains,
    confirmations: clamp($("confirmations").value, 1, 4, 2),
    waitSeconds: clamp($("waitSeconds").value, 0, 60, 5),
    allowMinutes: clamp($("allowMinutes").value, 1, 240, 15),
    askReason: $("askReason").checked
  });
  $("domains").value = domains.join("\n");
  $("saved").hidden = false;
  setTimeout(() => ($("saved").hidden = true), 1500);
};

load();
