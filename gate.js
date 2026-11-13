const params = new URLSearchParams(location.search);
const target = params.get("url");
const domain = params.get("domain");

const QUESTIONS = [
  ["Do you really need to go to <span class='domain'>{d}</span>?", "Are you going there for a specific reason, or just out of habit?"],
  ["Sure? What do you need to do on <span class='domain'>{d}</span>?", "If you can't answer in one sentence, you probably don't need it."],
  ["Last time: is it worth it, right now?", "Take a breath. You can always come back later."],
  ["Really, really?", "Is there something more important you were doing?"]
];

let step = 0;
let settings;
const $ = (id) => document.getElementById(id);

async function init() {
  settings = await getSettings();
  const { stats = {} } = await chrome.storage.local.get("stats");
  const s = stats[domain] || { avoided: 0, entered: 0 };
  if (s.avoided + s.entered > 0)
    $("stats").textContent = `On ${domain}: you walked away ${s.avoided} times, went in ${s.entered} times.`;
  render();
}

function render() {
  const n = settings.confirmations;
  const [q, sub] = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  $("question").innerHTML = q.replace("{d}", domain);
  $("sub").textContent = sub;
  $("steps").innerHTML = Array.from({ length: n }, (_, i) =>
    `<span class="${i < step ? "done" : ""}"></span>`).join("");

  // On the second step (if enabled) ask for a reason
  const showReason = settings.askReason && step === 1 && n > 1;
  $("reasonBox").hidden = !showReason;
  if (showReason) $("reason").focus();

  const yes = $("yes");
  const isLast = step === n - 1;
  yes.disabled = false;
  yes.textContent = isLast ? "Yes, let me in" : "Yes, I need it";

  if (showReason) {
    yes.disabled = true;
    $("reason").oninput = () => {
      yes.disabled = $("reason").value.trim().split(/\s+/).length < 3;
    };
  }

  if (isLast && settings.waitSeconds > 0 && !showReason) {
    let t = settings.waitSeconds;
    yes.disabled = true;
    yes.textContent = `Wait ${t}s…`;
    const iv = setInterval(() => {
      t--;
      if (t <= 0) { clearInterval(iv); yes.disabled = false; yes.textContent = "Yes, let me in"; }
      else yes.textContent = `Wait ${t}s…`;
    }, 1000);
  }
}

async function bump(field) {
  const { stats = {} } = await chrome.storage.local.get("stats");
  stats[domain] = stats[domain] || { avoided: 0, entered: 0 };
  stats[domain][field]++;
  await chrome.storage.local.set({ stats });
}

$("yes").onclick = async () => {
  step++;
  if (step < settings.confirmations) return render();

  const tab = await chrome.tabs.getCurrent();
  const until = Date.now() + settings.allowMinutes * 60 * 1000;
  await chrome.storage.session.set({ [`${tab.id}|${domain}`]: until });
  await bump("entered");
  location.replace(target);
};

// "No" at any step ends the flow immediately and leaves the site.
// replace() keeps the gate out of history, so "back" can't reopen it.
$("no").onclick = async () => {
  $("no").disabled = $("yes").disabled = true;
  await bump("avoided");
  location.replace("https://www.google.com");
};

init();
