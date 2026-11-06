// Static gallery: reads styles.json and renders one card per style.
// All text goes in through textContent; URLs come from our own JSON and are checked before use.
const $ = (id) => document.getElementById(id);

const safeUrl = (u) => {
  const url = new URL(u, location.href);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error(`blocked URL ${u}`);
  return url.href;
};
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const seconds = (s) => { const r = Math.round(s); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`; };

function link(href, label) {
  const a = el("a", "chip", label);
  a.href = safeUrl(href);
  return a;
}

function card(s) {
  const li = el("li", "card");
  const play = el("button", "poster");
  play.type = "button";
  play.setAttribute("aria-label", `${s.title.ja} を再生 / Play ${s.title.en}`);
  const img = el("img");
  img.src = safeUrl(s.stills[0]);
  img.alt = `${s.title.ja} のデモから一コマ`;
  img.loading = "lazy";
  img.width = 1280; img.height = 720;
  play.append(img, el("span", "play", "▶"), el("span", "dur", seconds(s.duration)));
  play.addEventListener("click", () => openPlayer(s));

  const body = el("div", "body");
  const kind = el("p", "kind", s.kind === "music-video" ? "MV" : "モーションコミック / motion comic");
  const h = el("h2", null, s.title.ja);
  const en = el("p", "title-en", s.title.en);
  en.lang = "en";
  const sum = el("p", "summary", s.summary.ja);
  const sumEn = el("p", "summary en", s.summary.en);
  sumEn.lang = "en";
  const subj = el("p", "subject", `題材: ${s.subject.ja}`);
  const thumbs = el("div", "thumbs");
  s.stills.slice(1).forEach((u, i) => {
    const t = el("img");
    t.src = safeUrl(u); t.alt = `${s.title.ja} の一コマ ${i + 2}`; t.loading = "lazy";
    t.width = 1280; t.height = 720;
    thumbs.append(t);
  });
  const links = el("div", "chips");
  links.append(link(s.credits, "CREDITS"), link(s.video1080, "1080p MP4"));
  body.append(kind, h, en, sum, sumEn, subj, thumbs, links);
  li.append(play, body);
  return li;
}

function openPlayer(s) {
  const v = $("player-video");
  $("player-title").textContent = `${s.title.ja} — ${s.title.en}`;
  v.src = safeUrl(s.video);
  $("player").showModal();
  v.play().catch(() => {});
}

$("player").addEventListener("close", () => { const v = $("player-video"); v.pause(); v.removeAttribute("src"); v.load(); });

async function main() {
  const res = await fetch("styles.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`styles.json: ${res.status}`);
  const data = await res.json();
  $("gallery").append(...data.styles.map(card));
  $("status").remove();
}

main().catch((e) => { $("status").textContent = `読み込めませんでした / Could not load: ${e.message}`; });
