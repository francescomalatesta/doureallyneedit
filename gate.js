const params = new URLSearchParams(location.search);
const target = params.get("url");
const domain = params.get("domain");
const expired = params.get("expired") === "1";

// Per-style copy
const COPY = {
  breathe: {
    no: "No, never mind", yes: "Yes, I need it", last: "Yes, let me in",
    wait: (s) => `Wait ${s}s…`, reason: "In a few words, why?",
    stats: (a, e) => `On ${domain}: you walked away ${a} times, went in ${e}.`,
    expired: `Time's up. Your time on ${domain} is over.`
  },
  terminal: {
    no: "[ N ] no, never mind", yes: "[ y ] yes, I need it", last: "[ y ] yes, let me in",
    wait: (s) => `[ y ] wait ${s}s…`, reason: "$ reason --why",
    stats: (a, e) => `stats: ${domain} · avoided=${a} · entered=${e}`,
    expired: `[doureallyneedit] session expired · ${domain} locked again`
  },
  arcade: {
    no: "B · NOPE", yes: "A · I NEED IT", last: "A · LET ME IN",
    wait: (s) => `A · WAIT ${s}`, reason: "STATE YOUR QUEST",
    stats: () => "",
    expired: "TIME OVER"
  }
};

let step = 0;
let settings, copy, questions, timer;
const $ = (id) => document.getElementById(id);
const pad6 = (n) => String(n).padStart(6, "0");

async function init() {
  settings = await getSettings();
  copy = COPY[settings.style];
  applyTheme(settings.style);
  questions = shuffle(QUESTIONS).slice(0, settings.confirmations);

  const { stats = {} } = await chrome.storage.local.get("stats");
  const s = stats[domain] || { avoided: 0, entered: 0 };
  $("stats").textContent = s.avoided + s.entered > 0 ? copy.stats(s.avoided, s.entered) : "";
  $("hudDomain").textContent = domain.toUpperCase();
  $("hudAvoided").textContent = pad6(s.avoided);
  $("hudEntered").textContent = pad6(s.entered);
  $("termUrl").textContent = `open ${target}`;
  $("reasonLabel").textContent = copy.reason;
  $("no").textContent = copy.no;
  if (expired) {
    $("expired").textContent = copy.expired;
    $("expired").hidden = false;
  }
  if (settings.style === "arcade") makeStars($("stars"), 40);

  document.body.classList.add("ready");
  render();
}

function render() {
  const n = settings.confirmations;
  const isLast = step === n - 1;
  const [q, sub] = questions[step];

  $("question").textContent = q.replaceAll("{d}", domain);
  $("sub").textContent = sub;
  replay($("qa"), "enter");

  $("dots").innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("");
  $("termStep").textContent = `${step + 1}/${n}`;
  $("stage").textContent = `STAGE ${step + 1}-${n}`;

  // On the second step (if enabled) ask for a reason
  const showReason = settings.askReason && step === 1 && n > 1;
  $("reasonBox").hidden = !showReason;

  const yes = $("yes");
  yes.disabled = false;
  yes.textContent = isLast ? copy.last : copy.yes;
  $("arcadeCount").hidden = true;

  if (showReason) {
    $("reason").value = "";
    $("reason").focus();
    yes.disabled = true;
    $("reason").oninput = () => {
      yes.disabled = $("reason").value.trim().split(/\s+/).filter(Boolean).length < 3;
    };
  }

  if (isLast && settings.waitSeconds > 0 && !showReason) countdown(settings.waitSeconds);
}

function countdown(seconds) {
  const yes = $("yes");
  let t = seconds;
  const tick = () => {
    yes.disabled = true;
    yes.textContent = copy.wait(t);
    $("arcadeCount").hidden = false;
    $("countNum").textContent = t;
    replay($("countNum"), "tick");
  };
  tick();
  clearInterval(timer);
  timer = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(timer);
      yes.disabled = false;
      yes.textContent = copy.last;
      $("countNum").textContent = "GO";
    } else tick();
  }, 1000);
}

async function bump(field) {
  const { stats = {} } = await chrome.storage.local.get("stats");
  stats[domain] = stats[domain] || { avoided: 0, entered: 0 };
  stats[domain][field]++;
  await chrome.storage.local.set({ stats });
}

async function onYes() {
  if ($("yes").disabled) return;
  step++;
  if (step < settings.confirmations) return render();

  $("yes").disabled = $("no").disabled = true;
  // Unlock the whole domain (every tab); the background re-locks open tabs when time is up.
  await unlockDomain(domain, settings.allowMinutes);
  await bump("entered");
  location.replace(target);
}

// "No" at any step ends the flow immediately and leaves the site.
// replace() keeps the gate out of history, so "back" can't reopen it.
async function onNo() {
  if ($("no").disabled) return;
  $("no").disabled = $("yes").disabled = true;
  clearInterval(timer);
  await bump("avoided");
  location.replace("https://www.google.com");
}

$("yes").onclick = onYes;
$("no").onclick = onNo;

// Keyboard: y = yes, n / Escape = no (ignored while typing a reason)
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "TEXTAREA") return;
  const k = e.key.toLowerCase();
  if (k === "y") onYes();
  else if (k === "n" || k === "escape") onNo();
});

init();
