// Shared settings and helpers
const STYLES = ["breathe", "terminal", "arcade"];

const DEFAULTS = {
  domains: ["youtube.com", "reddit.com", "x.com", "facebook.com", "instagram.com"],
  confirmations: 2,      // how many times to ask for confirmation
  waitSeconds: 5,        // countdown before the last confirmation can be clicked
  allowMinutes: 15,      // how long the site stays unlocked after confirming
  askReason: true,       // ask the user to type a reason
  style: "breathe"       // visual style: breathe | terminal | arcade
};

// Question pool: one is picked at random for each step, no repeats per visit.
// {d} is replaced with the blocked domain.
const QUESTIONS = [
  ["Do you really need {d} right now?", "Or is this just muscle memory?"],
  ["What were you doing before this?", "Maybe go back to that."],
  ["Will future you thank you for this?", "Be honest."],
  ["Is this a need, or an itch?", "Itches usually pass in about a minute."],
  ["What's the one thing you're looking for on {d}?", "If there isn't one, there's your answer."],
  ["Did you open this tab on purpose?", "Your fingers sometimes have their own agenda."],
  ["How long are you planning to stay?", "And how long will you actually stay?"],
  ["Is anything on {d} going to change your day?", "Most of it can wait until tomorrow."],
  ["Bored, tired, or avoiding something?", "Any of those is fine. Scrolling won't fix it."],
  ["Could this wait until your next break?", "It'll still be there."],
  ["What would you do with the next 20 minutes otherwise?", "That's the real price of this click."],
  ["Information, or distraction?", "Both are allowed. Just pick one on purpose."],
  ["Is {d} the best use of this moment?", "Not a rhetorical question."],
  ["When did you last check {d}?", "Probably not that long ago."],
  ["If {d} disappeared for a day, would you miss anything?", "Think about it for a second."],
  ["Are you putting off something specific?", "Name it, and it gets smaller."],
  ["Would a glass of water or a short walk do better?", "Your body might be asking for something else."],
  ["Is this a reward, or an escape?", "Rewards are earned. Escapes are borrowed."],
  ["Can you say why you're here in five words?", "Go ahead, in your head."],
  ["Is there someone you'd rather talk to instead?", "A message to a friend beats a feed."],
  ["What's the worst that happens if you skip {d}?", "Usually: nothing at all."],
  ["Are you here to create, or to consume?", "Both are fine. Just know which one it is."],
  ["Will you remember anything from {d} tomorrow?", "If not, it's just noise."],
  ["Did something just frustrate you?", "Feeds make a poor painkiller."],
  ["Is your task done, or did you just get stuck?", "Being stuck is a signal, not an exit."],
  ["What's one thing you could finish in the next 10 minutes?", "Do that first, then decide."],
  ["Have you taken a breath in the last minute?", "Take one now. Then choose."],
  ["Will {d} leave you feeling better or worse in an hour?", "You already know the answer."],
  ["Still sure?", "You've come this far. That already says something."],
  ["Okay, really: do you need it?", "No judgment either way."]
];

async function getSettings() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  const merged = { ...DEFAULTS, ...s };
  if (!STYLES.includes(merged.style)) merged.style = DEFAULTS.style;
  return merged;
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

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Show only the elements tagged for the active style (data-theme="a b").
function applyTheme(style) {
  STYLES.forEach(s => document.body.classList.toggle("theme-" + s, s === style));
  document.querySelectorAll("[data-theme]").forEach(el => {
    el.hidden = !el.dataset.theme.split(" ").includes(style);
  });
}

// Restart a CSS animation class on an element.
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// Twinkling stars for the arcade style.
function makeStars(container, count) {
  const colors = ["#FFFFFF", "#3FE0FF", "#FF3FA4", "#FFE14D"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const size = Math.random() > 0.8 ? 6 : 3;
    s.className = "star";
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 85}%;width:${size}px;height:${size}px;` +
      `background:${colors[i % colors.length]};animation-delay:${(Math.random() * 2.4).toFixed(2)}s`;
    container.appendChild(s);
  }
}
