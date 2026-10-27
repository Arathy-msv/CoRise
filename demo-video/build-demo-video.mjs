import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const frames = path.join(root, "frames");
const audioDir = path.join(root, "audio");
const html = path.join(root, "walkthrough.html");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outPath = path.join(root, "corise-saas-walkthrough.avi");

const lines = [
  "Welcome to Corise. This is the live site. Choose SaaS Edition to open the cloud workspace. Licensed Edition is the self-hosted option.",
  "In SaaS Edition there are four roles. We continue as Platform Admin. This person creates organization websites. The organization admin, supporter, and visitor each have their own view.",
  "The platform admin describes Riverside Student Club, then builds the organization website. Campaigns are added later by the organization admin.",
  "This is the website preview. It shows the organization name and a place for campaigns. The platform admin publishes the site. No campaign is created yet.",
  "Publishing asks who will manage the organization. The platform admin enters the organization admin name and email. Corise creates a password for them.",
  "The website is ready. Here is the public link, the admin email, and the password. We open the admin dashboard.",
  "The organization admin sign-in already shows that email and password. The credential button can fill them again. Then the admin signs in.",
  "This is the organization dashboard. It shows active campaigns, drafts, funds raised, and supporters. The organization admin creates a campaign.",
  "The campaign needs a headline, a short description, and a money goal of five hundred dollars. No real payment is taken.",
  "Supporters can play a game, contribute directly, or do both. This campaign lets the visitor choose.",
  "The organization admin publishes the campaign. A public link is ready to share.",
  "The admin shares the campaign with supporters by email. They select people and send a demo invitation. No real email is sent.",
  "A visitor opens the public page. They can play the garden game, or contribute directly. We open the game.",
  "This is the garden game window. The visitor can water the tree, add fertilizer, or give it sunlight. Each care action suggests a contribution. No real payment is taken.",
  "The visitor can also contribute directly. They choose twenty-five dollars and press Pay now. This is a demo contribution, recorded in this browser. No real payment is collected.",
  "Coming next is the supporter dashboard. A supporter joins a campaign, writes their own note, and sees a leadership board with the amount raised.",
];

fs.mkdirSync(frames, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });

function speak(text, wavPath) {
  const txtPath = wavPath + ".txt";
  fs.writeFileSync(txtPath, text, "utf8");
  const ps = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = -2
$preferred = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Name -match 'Zira|Jenny|Aria|Hazel' } | Select-Object -First 1
if ($preferred) { $synth.SelectVoice($preferred.VoiceInfo.Name) }
$synth.SetOutputToWaveFile('${wavPath.replace(/\\/g, "\\\\")}')
$synth.Speak((Get-Content -Raw -Encoding UTF8 '${txtPath.replace(/\\/g, "\\\\")}'))
$synth.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
}

function parseWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("not wav");
  const channels = buf.readUInt16LE(22);
  const rate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "data") {
      return { rate, channels, bits, pcm: buf.subarray(offset + 8, offset + 8 + size) };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error("wav has no data");
}

function screenshot(index) {
  const png = path.join(frames, `scene-${index}.png`);
  const url = "file:///" + html.replace(/\\/g, "/") + "?scene=" + index;
  execFileSync(edge, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1280,720",
    `--screenshot=${png}`,
    url,
  ], { stdio: "inherit" });
  return png;
}

function toJpeg(png, jpg) {
  const ps = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${png.replace(/\\/g, "\\\\")}')
$bmp = New-Object System.Drawing.Bitmap 1280, 720
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, 1280, 720)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$bmp.Save('${jpg.replace(/\\/g, "\\\\")}', $codec, $ep)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
}

function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
}
function four(s) {
  return Buffer.from(s, "ascii");
}
function chunk(id, data) {
  const pad = data.length % 2 ? Buffer.from([0]) : Buffer.alloc(0);
  return Buffer.concat([four(id), u32(data.length), data, pad]);
}

const reuse = process.argv.includes("--reuse");
const live = process.argv.includes("--live");
const clips = [];
for (let i = 0; i < lines.length; i += 1) {
  const n = i + 1;
  const wavPath = path.join(audioDir, `scene-${n}.wav`);
  const jpgPath = path.join(frames, `scene-${n}.jpg`);
  if (!reuse) {
    process.stdout.write(`speech ${n}\n`);
    speak(lines[i], wavPath);
    process.stdout.write(`shot ${n}\n`);
    toJpeg(live ? path.join(frames, `scene-${n}.png`) : screenshot(n), jpgPath);
  }
  const wav = parseWav(fs.readFileSync(wavPath));
  if (wav.channels !== 1 || wav.bits !== 16) throw new Error(`unexpected wav format scene ${n}`);
  clips.push({ jpg: fs.readFileSync(jpgPath), pcm: wav.pcm, rate: wav.rate });
}

const rate = clips[0].rate;
const bytesPerSecond = rate * 2;
const seconds = clips.map((clip) => Math.max(1, Math.ceil(clip.pcm.length / bytesPerSecond)));
const totalSeconds = seconds.reduce((sum, n) => sum + n, 0);

const videoChunks = [];
const audioChunks = [];
clips.forEach((clip, index) => {
  const hold = seconds[index];
  const need = hold * bytesPerSecond;
  const pcm = Buffer.alloc(need);
  clip.pcm.copy(pcm, 0, 0, Math.min(clip.pcm.length, need));
  for (let s = 0; s < hold; s += 1) {
    videoChunks.push(chunk("00dc", clip.jpg));
    audioChunks.push(chunk("01wb", pcm.subarray(s * bytesPerSecond, (s + 1) * bytesPerSecond)));
  }
});

const moviParts = [];
for (let i = 0; i < videoChunks.length; i += 1) {
  moviParts.push(videoChunks[i], audioChunks[i]);
}
const moviBody = Buffer.concat([four("movi"), ...moviParts]);
const moviList = Buffer.concat([four("LIST"), u32(moviBody.length), moviBody]);

const index = [];
let cursor = 4;
for (let i = 0; i < videoChunks.length; i += 1) {
  index.push(four("00dc"), u32(0x10), u32(cursor), u32(videoChunks[i].readUInt32LE(4)));
  cursor += videoChunks[i].length;
  index.push(four("01wb"), u32(0x10), u32(cursor), u32(audioChunks[i].readUInt32LE(4)));
  cursor += audioChunks[i].length;
}
const idx1 = chunk("idx1", Buffer.concat(index));

const avih = Buffer.concat([
  u32(1_000_000),
  u32(1280 * 720 * 3 + bytesPerSecond),
  u32(0),
  u32(0x10),
  u32(totalSeconds),
  u32(0),
  u32(2),
  u32(Math.max(...clips.map((c) => c.jpg.length))),
  u32(1280),
  u32(720),
  Buffer.alloc(16),
]);

function streamHeader(type, handler, scale, sampleRate, length, sampleSize, bufferSize) {
  return Buffer.concat([
    four(type),
    handler,
    u32(0),
    u16(0),
    u16(0),
    u32(0),
    u32(scale),
    u32(sampleRate),
    u32(0),
    u32(length),
    u32(bufferSize),
    u32(0xffffffff),
    u32(sampleSize),
    u16(0),
    u16(0),
    u16(type === "vids" ? 1280 : 0),
    u16(type === "vids" ? 720 : 0),
  ]);
}

const videoFormat = Buffer.concat([
  u32(40),
  u32(1280),
  u32(720),
  u16(1),
  u16(24),
  four("MJPG"),
  u32(1280 * 720 * 3),
  u32(0),
  u32(0),
  u32(0),
  u32(0),
]);
const audioFormat = Buffer.concat([
  u16(1),
  u16(1),
  u32(rate),
  u32(bytesPerSecond),
  u16(2),
  u16(16),
]);

function streamList(header, format) {
  const body = Buffer.concat([four("strl"), chunk("strh", header), chunk("strf", format)]);
  return Buffer.concat([four("LIST"), u32(body.length), body]);
}

const hdrlBody = Buffer.concat([
  four("hdrl"),
  chunk("avih", avih),
  streamList(streamHeader("vids", four("MJPG"), 1, 1, totalSeconds, 0, Math.max(...clips.map((c) => c.jpg.length))), videoFormat),
  streamList(streamHeader("auds", Buffer.alloc(4), 1, rate, totalSeconds * rate, 2, bytesPerSecond), audioFormat),
]);
const hdrl = Buffer.concat([four("LIST"), u32(hdrlBody.length), hdrlBody]);
const riffBody = Buffer.concat([four("AVI "), hdrl, moviList, idx1]);
const file = Buffer.concat([four("RIFF"), u32(riffBody.length), riffBody]);
fs.writeFileSync(outPath, file);
const minutes = Math.floor(totalSeconds / 60);
const rem = totalSeconds % 60;
process.stdout.write(`wrote ${outPath} ${minutes}m${rem}s ${file.length} bytes\n`);
