import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const frames = path.join(root, "frames");
const profile = path.join(root, ".edge-profile");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9333;
const origin = "https://arathy-msv.github.io/CoRise";

fs.mkdirSync(frames, { recursive: true });
fs.rmSync(profile, { recursive: true, force: true });

const browser = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--disable-extensions",
  "--force-device-scale-factor=1",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--window-size=1280,720",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function debuggerUrl() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`));
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* edge still starting */ }
    await sleep(250);
  }
  throw new Error("Edge debugger did not start");
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const pending = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) pending.reject(new Error(JSON.stringify(msg.error)));
        else pending.resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const ws = new WebSocket(await debuggerUrl());
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
const cdp = new Cdp(ws);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false,
});

async function js(expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "page script failed");
  }
  return result.result?.value;
}

async function waitFor(text, ms = 25000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const found = await js(`Boolean(document.body && document.body.innerText.includes(${JSON.stringify(text)}))`);
    if (found) return;
    await sleep(300);
  }
  const sample = await js(`(document.body && document.body.innerText || "").slice(0, 1200)`);
  const href = await js("location.href");
  throw new Error(`Timed out waiting for "${text}" at ${href}\n${sample}`);
}

async function waitForUrl(part, ms = 25000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const href = await js("location.href");
    if (href && href.includes(part) && !href.includes("/open/dashboard")) return href;
    await sleep(300);
  }
  const href = await js("location.href");
  const sample = await js(`(document.body && document.body.innerText || "").slice(0, 800)`);
  throw new Error(`Timed out waiting for URL "${part}" at ${href}\n${sample}`);
}

async function goto(url) {
  await cdp.send("Page.navigate", { url });
  await sleep(800);
}

function removeHand() {
  return js(`document.getElementById("demo-hand")?.remove()`);
}

async function handOn(text) {
  const wants = (Array.isArray(text) ? text : [text]).map((item) => item.toLowerCase());
  const placed = await js(`(() => {
    const wants = ${JSON.stringify(wants)};
    const nodes = [...document.querySelectorAll("button, a, [role='button'], label, h1, h2, h3, p")];
    const el = nodes.find((node) => {
      const label = (node.innerText || "").replace(/\\s+/g, " ").trim().toLowerCase();
      return label && wants.some((want) => label.includes(want));
    });
    if (!el) return { ok: false };
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = el.getBoundingClientRect();
    let hand = document.getElementById("demo-hand");
    if (!hand) {
      hand = document.createElement("div");
      hand.id = "demo-hand";
      hand.textContent = "👆";
      hand.setAttribute("aria-hidden", "true");
      hand.style.cssText = "position:fixed;z-index:2147483647;font-size:92px;line-height:1;pointer-events:none;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45));";
      document.body.appendChild(hand);
    }
    let x = rect.right - 30;
    let y = Math.max(0, rect.top - 6);
    if (x > window.innerWidth - 100) {
      x = Math.max(0, rect.left + rect.width / 2 - 46);
      y = Math.min(window.innerHeight - 100, rect.bottom - 10);
    }
    if (y > window.innerHeight - 96) y = Math.max(0, rect.top - 84);
    hand.style.left = x + "px";
    hand.style.top = y + "px";
    return { ok: true, label: (el.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 90) };
  })()`);
  if (!placed?.ok) {
    const sample = await js(`(document.body && document.body.innerText || "").slice(0, 800)`);
    throw new Error(`Could not point at "${text}"\n${sample}`);
  }
  return placed;
}

async function clickText(text) {
  await removeHand();
  const wants = (Array.isArray(text) ? text : [text]).map((item) => item.toLowerCase());
  const clicked = await js(`(() => {
    const wants = ${JSON.stringify(wants)};
    const nodes = [...document.querySelectorAll("button, a, [role='button']")];
    const el = nodes.find((node) => {
      const label = (node.innerText || "").replace(/\\s+/g, " ").trim().toLowerCase();
      return wants.some((want) => label.includes(want));
    });
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Could not click "${text}"`);
}

async function fill(selector, value) {
  const ok = await js(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!ok) throw new Error(`Could not fill ${selector}`);
}

async function shot(index) {
  await sleep(250);
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
  const file = path.join(frames, `scene-${index}.png`);
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  const href = await js("location.href");
  process.stdout.write(`scene ${index} ${href}\n`);
}

try {
  await goto(`${origin}/`);
  await waitFor("Start Cloud Workspace");
  await handOn("Start Cloud Workspace");
  await shot(1);

  await clickText("Start Cloud Workspace");
  await waitFor("Who are you signing in as?");
  await handOn("Platform Admin");
  await shot(2);

  await clickText("Continue as Platform Admin");
  await waitFor("Build Organization Website");
  await clickText("School or Student Club");
  await sleep(400);
  await handOn("Build Organization Website");
  await shot(3);

  await clickText("Build Organization Website");
  await waitFor("Publish");
  await sleep(600);
  await handOn("Publish");
  await shot(4);

  await clickText("Publish");
  await waitFor("Organization admin name");
  await fill('input[autocomplete="name"]', "Asha Menon");
  await fill('input[autocomplete="email"]', "asha@riverside.demo");
  await handOn("Create organization");
  await shot(5);

  await clickText("Create organization");
  await waitFor("Go to Admin Dashboard");
  const labeled = await js(`(() => {
    const link = [...document.querySelectorAll("a")].find((node) => (node.innerText || "").includes("Go to Admin Dashboard"));
    if (!link) return false;
    link.style.setProperty("color", "#ffffff", "important");
    link.style.fontSize = "14px";
    link.style.fontWeight = "600";
    const rect = link.getBoundingClientRect();
    let hand = document.getElementById("demo-hand");
    if (!hand) {
      hand = document.createElement("div");
      hand.id = "demo-hand";
      hand.textContent = "👆";
      hand.setAttribute("aria-hidden", "true");
      hand.style.cssText = "position:fixed;z-index:2147483647;font-size:92px;line-height:1;pointer-events:none;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45));";
      document.body.appendChild(hand);
    }
    hand.style.left = Math.min(window.innerWidth - 100, Math.max(0, rect.left + rect.width / 2 - 10)) + "px";
    hand.style.top = Math.min(window.innerHeight - 96, rect.bottom - 6) + "px";
    return true;
  })()`);
  if (!labeled) throw new Error("Dashboard button was not on the ready dialog");
  await shot(6);
  if (process.argv.includes("--ready-only")) {
    process.stdout.write("ready frame only\n");
  } else {
  await clickText("Go to Admin Dashboard");
  await waitFor("Organization sign in");
  await sleep(500);
  const hasHint = await js(`Boolean(document.body.innerText.includes("Click to fill email and password"))`);
  await handOn(hasHint ? "Click to fill email and password" : "Sign In");
  await shot(7);

  await clickText("Sign In");
  await waitFor("Campaign");
  await sleep(500);
  await handOn(["New Campaign", "Create Your First Campaign", "Create campaign"]);
  await shot(8);

  await clickText(["New Campaign", "Create Your First Campaign", "Create campaign"]);
  await waitForUrl("/campaign");
  await sleep(800);
  const formKind = await js(`document.body.innerText.includes("Target amount") ? "goal" : document.body.innerText.includes("What would you like to tell people") ? "prompt" : "other"`);
  if (formKind === "goal") {
    await waitFor("Headline");
    await fill("#campaign-headline", "School garden supplies");
    await fill("#campaign-description", "Help Riverside Student Club buy soil, seeds, and tools for the school garden.");
    await fill("#campaign-target", "500");
    await handOn("Next: Donation setup");
  } else if (formKind === "prompt") {
    await fill("textarea", "Help Riverside Student Club buy soil, seeds, and tools for the school garden. Goal 500 dollars.");
    await handOn("Create My Campaign");
  } else {
    const sample = await js(`location.href + "\\n" + (document.body.innerText || "").slice(0, 900)`);
    throw new Error(`Unexpected campaign form\n${sample}`);
  }
  await shot(9);

  await clickText("Next: Donation setup");
  await waitFor("How can people donate?");
  await clickText("Both (Direct & Game)");
  await sleep(300);
  await handOn("Next: Review & Publish");
  await shot(10);

  await clickText("Next: Review & Publish");
  await waitFor("Publish campaign");
  await handOn("Publish campaign");
  await shot(11);

  await clickText("Publish campaign");
  await waitFor("Share with supporters");
  await clickText("Share with supporters");
  await waitFor("Select all");
  await js(`(() => {
    const boxes = [...document.querySelectorAll('input[type="checkbox"]')];
    const all = boxes.find((box) => (box.closest("label")?.innerText || "").includes("Select all"));
    if (all && !all.checked) all.click();
  })()`);
  await sleep(250);
  await handOn("Send invitations");
  await shot(12);

  const liveHref = await js(`document.querySelector('a[href*="/org/"]')?.href || ""`);
  const orgSlug = await js(`(location.pathname.match(/org\\/([^/]+)/) || [])[1] || ""`);
  await goto(liveHref || `${origin}/org/greensteps/our-school-garden/`);
  await sleep(1200);
  const blocked = await js(`document.body.innerText.includes("couldn’t load") || document.body.innerText.includes("couldn't load") || document.title.includes("404")`);
  if (blocked) {
    await goto(`${origin}/org/greensteps/our-school-garden/`);
    await sleep(1200);
  }
  await waitFor("How would you like to support?");
  await handOn(process.argv.includes("--game-only") ? "Play the game" : "Direct pay");
  await shot(13);

  if (process.argv.includes("--game-only")) {
    await clickText("Continue");
    await waitFor("Every little action");
    await sleep(1200);
    await js(`document.querySelector('[data-care="water"]')?.scrollIntoView({ block: "end" })`);
    await sleep(300);
    await handOn("Water");
    await shot(14);
    process.stdout.write("game frame only\n");
  } else {
  await js(`document.querySelector('input[name="support-mode"][value="pay"]')?.click()`);
  await sleep(200);
  await clickText("Continue");
  await waitFor("Pay now");
  await js(`(() => {
    const button = [...document.querySelectorAll("button")].find((node) => (node.innerText || "").replace(/\\s+/g, "").includes("$25"));
    if (button) button.click();
  })()`);
  await sleep(250);
  await handOn("Pay now");
  await shot(14);

  await goto(`${origin}/supporter/?org=riverside-student-club`);
  await waitFor("Join campaign");
  await clickText("Join campaign");
  await waitFor("Your note");
  await fill("textarea", "I will share this with my class.");
  await js(`document.querySelector("form button[type='submit']")?.click()`);
  await sleep(400);
  const done = await js(`Boolean([...document.querySelectorAll("button")].find((node) => (node.innerText || "").trim() === "Done"))`);
  if (done) await clickText("Done");
  await waitFor("Amount you raised");
  await handOn("Edit note");
  await shot(15);

  process.stdout.write("captured\n");
  }
  }
} finally {
  ws.close();
  browser.kill();
}
