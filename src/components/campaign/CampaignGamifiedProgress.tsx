"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { GoalType, ProgressWidget } from "@/types/corise";
import { formatGoalValue, progressPercent, stageFor, stageLabel, type ProgressStage } from "@/lib/progress";
import { SHELTER_SPRITES } from "@/lib/shelter";
import { CAMPFIRE_SPRITES, FIRE_RING } from "@/lib/campfire";
import { CASTLE_STAGE_IMAGES } from "@/lib/castle";

type Props = {
  type: ProgressWidget;
  currentAmount: number;
  targetAmount: number;
  goalType?: GoalType;
  /** Card-grid preview: scene only plus a slim caption. */
  compact?: boolean;
  /** Just the illustration — no caption, no stats. Caller renders its own compact stats row below. */
  sceneOnly?: boolean;
  className?: string;
};

const CONFETTI_COLORS = ["#FF5D73", "#FFC93C", "#43E58A", "#4CC9F0", "#B388FF", "#FF8A3D"];

/** Eases displayed progress toward the real value so fills and the race car glide instead of jumping. */
export function useTweened(target: number, ms = 900): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const origin = from.current;
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / ms));
      const current = origin + (target - origin) * (1 - Math.pow(1 - k, 3));
      from.current = current;
      setValue(current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

function Confetti({ loop = false }: { loop?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${loop ? "gp-confetti-loop" : ""}`}>
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="gp-confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 9) * (loop ? 0.32 : 0.06)}s`,
            transform: `rotate(${(i * 47) % 180}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Tree ──────────────────────────────────────────────────────── */

function useSvgId(name: string): string {
  return `${name}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function TreeScene({ stage }: { stage: ProgressStage }) {
  const sky = useSvgId("gp-sky");
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFE8FF" />
          <stop offset="1" stopColor="#F2FBFF" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${sky})`} />
      <g transform="translate(52 34)">
        <g className="gp-float">
          <ellipse cx="0" cy="0" rx="22" ry="10" fill="#fff" />
          <ellipse cx="16" cy="-6" rx="14" ry="10" fill="#fff" />
          <ellipse cx="-14" cy="-3" rx="10" ry="7" fill="#fff" />
        </g>
      </g>
      {stage >= 2 ? (
        <g transform="translate(272 38)">
          <g className="gp-pop">
            <g className="gp-spin-slow">
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x="-2" y="-30" width="4" height="10" rx="2" fill="#FFC93C" transform={`rotate(${i * 36})`} />
              ))}
            </g>
            <circle r="17" fill="#FFD84D" stroke="#F4A623" strokeWidth="2" />
            <circle cx="-5" cy="-3" r="1.8" fill="#5B3A1A" />
            <circle cx="5" cy="-3" r="1.8" fill="#5B3A1A" />
            <path d="M-6 4 Q0 9 6 4" stroke="#5B3A1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        </g>
      ) : null}
      <path d="M0 138 Q40 130 80 136 T160 134 T240 137 T320 133 V180 H0Z" fill="#7BCB52" />
      <rect y="146" width="320" height="34" fill="#8B5A2B" />
      {[30, 92, 210, 290].map((x) => (
        <ellipse key={x} cx={x} cy="162" rx="6" ry="2.5" fill="#6E4520" />
      ))}

      <g transform="translate(160 146)">
        <g key={stage} className="gp-pop">
          {stage === 0 ? (
            <>
              <ellipse cx="0" cy="0" rx="26" ry="7" fill="#6E4520" />
              <path d="M0 -2 V-20" stroke="#3E8E2F" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="-7" cy="-21" rx="8" ry="4.5" fill="#5DBB3F" transform="rotate(-25 -7 -21)" />
              <ellipse cx="7" cy="-23" rx="8" ry="4.5" fill="#5DBB3F" transform="rotate(25 7 -23)" />
            </>
          ) : null}
          {stage === 1 ? (
            <>
              <ellipse cx="0" cy="0" rx="26" ry="7" fill="#6E4520" />
              <g className="gp-sway">
                <path d="M0 -2 V-44" stroke="#3E8E2F" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="-10" cy="-26" rx="11" ry="5.5" fill="#5DBB3F" transform="rotate(-25 -10 -26)" />
                <ellipse cx="10" cy="-32" rx="11" ry="5.5" fill="#5DBB3F" transform="rotate(25 10 -32)" />
                <ellipse cx="-8" cy="-44" rx="9" ry="5" fill="#73D150" transform="rotate(-30 -8 -44)" />
                <ellipse cx="8" cy="-47" rx="9" ry="5" fill="#73D150" transform="rotate(30 8 -47)" />
              </g>
            </>
          ) : null}
          {stage >= 2 ? (
            <>
              <path
                d={stage === 2 ? "M-6 0 Q-4 -30 -5 -52 H5 Q4 -30 6 0Z" : "M-9 0 Q-6 -40 -7 -66 H7 Q6 -40 9 0Z"}
                fill="#8B5A2B"
              />
              <g className="gp-sway">
                {(stage === 2
                  ? [
                      [0, -70, 26],
                      [-20, -58, 18],
                      [20, -58, 18],
                    ]
                  : [
                      [0, -96, 32],
                      [-30, -80, 24],
                      [30, -80, 24],
                      [-18, -108, 20],
                      [18, -108, 20],
                    ]
                ).map(([cx, cy, r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#4FB23A" : "#5DC447"} />
                ))}
                {stage >= 3
                  ? [
                      [-24, -86],
                      [6, -112],
                      [26, -92],
                      [-6, -84],
                      [18, -72],
                      [-30, -70],
                      [0, -98],
                    ].map(([x, y], i) => (
                      <g key={`b${i}`} transform={`translate(${x} ${y})`}>
                        {[0, 72, 144, 216, 288].map((a) => (
                          <circle key={a} r="2.6" cx="0" cy="-3" fill="#FF9EC7" transform={`rotate(${a})`} />
                        ))}
                        <circle r="1.8" fill="#FFD84D" />
                      </g>
                    ))
                  : null}
                {stage === 4
                  ? [
                      [-14, -74],
                      [14, -100],
                      [34, -76],
                      [-34, -88],
                      [2, -80],
                    ].map(([x, y], i) => (
                      <g key={`f${i}`}>
                        <circle cx={x} cy={y} r="5" fill="#FF4D4D" />
                        <circle cx={x - 1.5} cy={y - 1.5} r="1.4" fill="#fff" opacity="0.7" />
                      </g>
                    ))
                  : null}
              </g>
            </>
          ) : null}
        </g>
      </g>

      {stage === 1 ? (
        <g transform="translate(214 64)">
          <g className="gp-pop">
            <g transform="rotate(-24)">
              <rect x="-18" y="-12" width="34" height="26" rx="5" fill="#4CC9F0" stroke="#2A8BB0" strokeWidth="2" />
              <path d="M-18 -4 L-42 -14 L-40 -8 L-18 4Z" fill="#4CC9F0" stroke="#2A8BB0" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 -8 Q30 0 16 10" stroke="#2A8BB0" strokeWidth="3" fill="none" />
            </g>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${-40 - i * 4} ${4 + i * 3})`}>
                <ellipse className="gp-drop" style={{ animationDelay: `${i * 0.35}s` }} rx="2.2" ry="3.2" fill="#4CC9F0" />
              </g>
            ))}
          </g>
        </g>
      ) : null}
      {stage === 2 ? (
        <g transform="translate(96 120)">
          <g className="gp-pop">
            <rect x="-12" y="-14" width="24" height="26" rx="3" fill="#E9C46A" stroke="#B5892E" strokeWidth="1.5" />
            <text x="0" y="-2" textAnchor="middle" fontSize="6" fontWeight="700" fill="#5B3A1A">
              HAPPY
            </text>
            <text x="0" y="6" textAnchor="middle" fontSize="5" fontWeight="700" fill="#5B3A1A">
              FERTILIZER
            </text>
          </g>
        </g>
      ) : null}
    </>
  );
}

/* ── Race ──────────────────────────────────────────────────────── */

type Pt = [number, number];
const TRACK: [Pt, Pt, Pt, Pt][] = [
  [[24, 142], [74, 142], [80, 62], [130, 62]],
  [[130, 62], [182, 62], [188, 142], [240, 134]],
  [[240, 134], [282, 128], [296, 92], [296, 50]],
];
const TRACK_D = `M${TRACK[0][0].join(" ")} ${TRACK.map(([, c1, c2, p]) => `C${c1.join(" ")} ${c2.join(" ")} ${p.join(" ")}`).join(" ")}`;

function bezier([p0, p1, p2, p3]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]) as Pt;
}

const TRACK_SAMPLES: { p: Pt; len: number }[] = (() => {
  const out: { p: Pt; len: number }[] = [];
  let len = 0;
  let prev: Pt | null = null;
  for (const seg of TRACK) {
    for (let i = 0; i <= 40; i++) {
      const p = bezier(seg, i / 40);
      if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      out.push({ p, len });
      prev = p;
    }
  }
  return out;
})();

function trackPoint(percent: number): { x: number; y: number; angle: number } {
  const total = TRACK_SAMPLES[TRACK_SAMPLES.length - 1].len;
  const goal = (Math.min(100, Math.max(0, percent)) / 100) * total;
  let i = TRACK_SAMPLES.findIndex((s) => s.len >= goal);
  if (i <= 0) i = 1;
  const a = TRACK_SAMPLES[i - 1];
  const b = TRACK_SAMPLES[i];
  const k = b.len === a.len ? 0 : (goal - a.len) / (b.len - a.len);
  return {
    x: a.p[0] + (b.p[0] - a.p[0]) * k,
    y: a.p[1] + (b.p[1] - a.p[1]) * k,
    angle: (Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) * 180) / Math.PI,
  };
}

function RaceScene({ stage, shown }: { stage: ProgressStage; shown: number }) {
  const car = trackPoint(shown);
  return (
    <>
      <rect width="320" height="180" fill="#9BDB72" />
      <rect width="320" height="34" fill="#C9ECFF" />
      <path d="M0 34 Q40 22 80 32 T170 28 T250 33 T320 26 V34 H0Z" fill="#7CC456" />
      {[
        [40, 100],
        [190, 40],
        [110, 160],
        [270, 160],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <circle r="9" fill="#58B043" />
          <circle cx="7" cy="2" r="7" fill="#4FA23B" />
        </g>
      ))}
      <path d={TRACK_D} stroke="#E63946" strokeWidth="28" fill="none" strokeLinecap="round" strokeDasharray="10 10" />
      <path d={TRACK_D} stroke="#fff" strokeWidth="28" fill="none" strokeLinecap="round" strokeDasharray="10 10" strokeDashoffset="10" />
      <path d={TRACK_D} stroke="#5C5F66" strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d={TRACK_D} stroke="#fff" strokeWidth="1.6" fill="none" strokeDasharray="7 7" opacity="0.8" />

      {[25, 50, 75].map((p) => {
        const pt = trackPoint(p);
        const passed = shown >= p;
        return (
          <g key={p} transform={`translate(${pt.x} ${pt.y - 18})`}>
            <path d="M0 0 V18" stroke="#5B3A1A" strokeWidth="2" />
            <path d="M0 0 L14 4 L0 8Z" fill={passed ? "#43E58A" : "#FFC93C"} />
            <circle cx="0" cy="-6" r="5.5" fill={passed ? "#FFD84D" : "#E6E6E6"} stroke={passed ? "#F4A623" : "#BDBDBD"} strokeWidth="1.5" />
            <text x="0" y="-4" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#5B3A1A">
              {p}
            </text>
          </g>
        );
      })}

      <g transform="translate(296 50)">
        <rect x="-15" y="-3" width="30" height="6" fill="#fff" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={-15 + i * 5} y={i % 2 ? 0 : -3} width="5" height="3" fill="#222" />
        ))}
        <path d="M14 -3 V-30" stroke="#5B3A1A" strokeWidth="2" />
        <g transform="translate(14 -30)">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={(i % 4) * 4} y={Math.floor(i / 4) * 4} width="4" height="4" fill={(i + Math.floor(i / 4)) % 2 ? "#fff" : "#222"} />
          ))}
        </g>
      </g>

      <g transform={`translate(${car.x} ${car.y}) rotate(${car.angle})`}>
        <g className={stage < 4 && shown > 0.5 ? "gp-rumble" : ""}>
          <rect x="-14" y="-7" width="28" height="14" rx="5" fill="#E63946" stroke="#9E1F2B" strokeWidth="1.5" />
          <rect x="-4" y="-5.5" width="10" height="11" rx="2.5" fill="#BDE7FF" />
          <rect x="-16" y="-9" width="6" height="4" rx="1.5" fill="#222" />
          <rect x="-16" y="5" width="6" height="4" rx="1.5" fill="#222" />
          <rect x="8" y="-9" width="6" height="4" rx="1.5" fill="#222" />
          <rect x="8" y="5" width="6" height="4" rx="1.5" fill="#222" />
          <circle cx="13" cy="-4" r="1.4" fill="#FFE066" />
          <circle cx="13" cy="4" r="1.4" fill="#FFE066" />
        </g>
      </g>

      {stage === 4 ? (
        <g transform="translate(250 22)">
          <g className="gp-pop">
            <path d="M-10 -8 H10 V0 Q10 10 0 12 Q-10 10 -10 0Z" fill="#FFD84D" stroke="#F4A623" strokeWidth="1.5" />
            <path d="M-10 -5 Q-17 -4 -14 3 Q-12 6 -9 5" stroke="#F4A623" strokeWidth="1.8" fill="none" />
            <path d="M10 -5 Q17 -4 14 3 Q12 6 9 5" stroke="#F4A623" strokeWidth="1.8" fill="none" />
            <rect x="-3" y="12" width="6" height="4" fill="#F4A623" />
            <rect x="-7" y="16" width="14" height="3" rx="1" fill="#B5892E" />
          </g>
        </g>
      ) : null}
    </>
  );
}

/* ── Rocket ────────────────────────────────────────────────────── */

const STARS: [number, number, number][] = [
  [30, 20, 1.4], [70, 50, 1], [110, 18, 1.6], [150, 42, 1], [200, 16, 1.3], [232, 60, 1], [284, 108, 1.4],
  [96, 92, 1], [262, 140, 1.1], [180, 86, 1.2], [58, 128, 1], [126, 132, 1.3], [300, 30, 1],
];

function Rocket({ flame }: { flame: 0 | 1 | 2 }) {
  return (
    <>
      {flame ? (
        <g transform="translate(0 30)">
          <g className="gp-flicker">
            <path d={flame === 2 ? "M-9 0 Q0 40 9 0Z" : "M-6 0 Q0 16 6 0Z"} fill="#FF8A3D" />
            <path d={flame === 2 ? "M-5 0 Q0 26 5 0Z" : "M-3 0 Q0 10 3 0Z"} fill="#FFD84D" />
          </g>
        </g>
      ) : null}
      <path d="M-11 22 L-20 32 L-11 30Z" fill="#E63946" />
      <path d="M11 22 L20 32 L11 30Z" fill="#E63946" />
      <path d="M0 -34 Q14 -18 12 10 L11 30 H-11 L-12 10 Q-14 -18 0 -34Z" fill="#F5F7FA" stroke="#C9CED6" strokeWidth="1.5" />
      <path d="M0 -34 Q9 -24 10 -16 H-10 Q-9 -24 0 -34Z" fill="#E63946" />
      <circle cy="-2" r="6" fill="#4CC9F0" stroke="#2A8BB0" strokeWidth="2" />
      <circle cx="-2" cy="-4" r="1.8" fill="#fff" opacity="0.8" />
      <rect x="-4" y="22" width="8" height="10" rx="2" fill="#E63946" />
    </>
  );
}

function RocketScene({ stage, shown }: { stage: ProgressStage; shown: number }) {
  const fuelH = (Math.min(100, Math.max(0, shown)) / 100) * 112;
  const night = useSvgId("gp-night");
  const fuel = useSvgId("gp-fuel");
  return (
    <>
      <defs>
        <linearGradient id={night} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141A46" />
          <stop offset="1" stopColor="#3B2F80" />
        </linearGradient>
        <linearGradient id={fuel} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#FFD84D" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${night})`} />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" className="gp-twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
      ))}
      <g transform="translate(262 40)">
        <circle r="24" fill="#E8E6F5" />
        <circle cx="-8" cy="-6" r="5" fill="#CFCBE6" />
        <circle cx="9" cy="6" r="6" fill="#CFCBE6" />
        <circle cx="-4" cy="11" r="3" fill="#CFCBE6" />
        {stage === 4 ? <ellipse rx="44" ry="13" fill="none" stroke="#B388FF" strokeWidth="1.5" strokeDasharray="4 4" transform="rotate(-18)" /> : null}
      </g>

      <g transform="translate(22 32)">
        <rect width="20" height="120" rx="10" fill="#1F2557" stroke="#8C94D9" strokeWidth="2" />
        <rect x="4" y={116 - fuelH} width="12" height={fuelH} rx="6" fill={`url(#${fuel})`} />
        {[30, 60, 90].map((y) => (
          <path key={y} d={`M20 ${y} H26`} stroke="#8C94D9" strokeWidth="1.5" />
        ))}
        <text x="10" y="136" textAnchor="middle" fontSize="8" fontWeight="800" fill="#C9CEFF">
          FUEL
        </text>
      </g>

      <path d="M110 166 H210 L200 152 H120Z" fill="#6B7280" />
      <rect x="104" y="166" width="112" height="14" fill="#4B5563" />
      <path d="M190 152 V96 M190 110 H178 M190 130 H178" stroke="#9CA3AF" strokeWidth="3" />

      {stage === 4 ? (
        <g transform="translate(206 66) rotate(28)">
          <g className="gp-launch">
            <Rocket flame={2} />
          </g>
        </g>
      ) : (
        <g transform="translate(160 118)">
          <g className={stage >= 2 ? "gp-rumble" : ""}>
            <Rocket flame={stage >= 3 ? 2 : stage >= 2 ? 1 : 0} />
          </g>
        </g>
      )}
      {stage >= 2 && stage < 4 ? (
        <g transform="translate(160 160)">
          {[-16, 0, 16].map((x, i) => (
            <circle key={x} cx={x} cy="0" r="7" fill="#E5E7EB" opacity="0.7" className="gp-float" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      ) : null}
    </>
  );
}

/* ── Cake ──────────────────────────────────────────────────────── */

function Drip({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  const n = Math.max(3, Math.round(w / 14));
  const step = w / n;
  let d = `M${x} ${y} H${x + w} V${y + 4}`;
  for (let i = n; i > 0; i--) {
    const cx = x + (i - 0.5) * step;
    d += ` Q${cx + step / 2} ${y + 4} ${cx} ${y + (i % 2 ? 11 : 7)} Q${cx - step / 2} ${y + 4} ${x + (i - 1) * step} ${y + 4}`;
  }
  return <path d={`${d} Z`} fill={color} />;
}

function CakeScene({ stage }: { stage: ProgressStage }) {
  const tiers = [
    { x: 92, y: 118, w: 136, h: 30, fill: "#F6A5C0" },
    { x: 110, y: 90, w: 100, h: 28, fill: "#FFD6A5" },
    { x: 128, y: 64, w: 64, h: 26, fill: "#BDE0FE" },
  ];
  return (
    <>
      <rect width="320" height="180" fill="#FFF1E3" />
      <path d="M0 14 Q80 34 160 18 T320 16" stroke="#C08457" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 12 + i * 29;
        const y = 18 + Math.sin(i * 0.9) * 4 + (i > 0 && i < 10 ? 4 : 0);
        return <path key={i} d={`M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 15}Z`} fill={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />;
      })}
      <rect y="150" width="320" height="30" fill="#C08457" />
      <rect y="150" width="320" height="5" fill="#A86B3C" />
      <ellipse cx="160" cy="150" rx="84" ry="7" fill="#F5F5F5" stroke="#D9D9D9" strokeWidth="1.5" />

      {stage === 0 ? (
        <g transform="translate(160 150)">
          <g className="gp-pop">
            <path d="M-34 -30 H34 Q30 0 0 0 Q-30 0 -34 -30Z" fill="#9AD1F5" stroke="#5FA8D3" strokeWidth="2" />
            <ellipse cx="0" cy="-30" rx="34" ry="6" fill="#FFE8B0" stroke="#5FA8D3" strokeWidth="2" />
            <g className="gp-sway">
              <path d="M10 -32 L30 -66" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="8" cy="-30" rx="5" ry="9" fill="none" stroke="#9CA3AF" strokeWidth="2" transform="rotate(30 8 -30)" />
            </g>
          </g>
        </g>
      ) : null}

      {tiers.map((t, i) =>
        stage >= i + 1 ? (
          <g key={i}>
            <g className="gp-pop">
              <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="6" fill={t.fill} />
              <rect x={t.x} y={t.y + t.h - 6} width={t.w} height="6" rx="3" fill="#000" opacity="0.06" />
              {Array.from({ length: Math.floor(t.w / 18) }, (_, k) => (
                <circle key={k} cx={t.x + 10 + k * 18} cy={t.y + t.h / 2 + 3} r="2" fill="#fff" opacity="0.8" />
              ))}
              {stage >= 3 ? <Drip x={t.x} y={t.y} w={t.w} color="#FFFDF7" /> : null}
            </g>
          </g>
        ) : null
      )}

      {stage >= 3 ? (
        <g transform="translate(160 64)">
          {[-18, 0, 18].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect x="-2.5" y="-20" width="5" height="20" rx="1.5" fill={x === 0 ? "#B388FF" : "#4CC9F0"} />
              <path d="M-2.5 -14 L2.5 -17 M-2.5 -8 L2.5 -11" stroke="#fff" strokeWidth="1.2" />
              {stage === 4 ? (
                <g transform="translate(0 -21)">
                  <g className="gp-flicker">
                    <path d="M0 -12 Q5 -5 0 0 Q-5 -5 0 -12Z" fill="#FF8A3D" />
                    <path d="M0 -7 Q2.5 -3 0 0 Q-2.5 -3 0 -7Z" fill="#FFD84D" />
                  </g>
                </g>
              ) : (
                <path d="M0 -20 V-24" stroke="#5B3A1A" strokeWidth="1.2" />
              )}
            </g>
          ))}
        </g>
      ) : null}
      {stage === 2 ? (
        <g transform="translate(160 90)">
          <circle cy="-4" r="5" fill="#E63946" className="gp-pop" />
        </g>
      ) : null}
    </>
  );
}

/* ── Cozy Paws shelter ────────────────────────────────────────── */

function ShelterScene({ stage }: { stage: ProgressStage }) {
  return (
    <>
      <image href="/images/shelter/shelter-bg.jpg" x="0" y="0" width="320" height="180" preserveAspectRatio="xMidYMid slice" />
      {SHELTER_SPRITES.filter((s) => stage >= s.from).map((s) => {
        const w = (s.w / 100) * 320;
        return (
          <image
            key={s.id}
            className="gp-pop"
            href={s.src}
            x={(s.x / 100) * 320 - w / 2}
            y={(s.y / 100) * 180 - w * 0.75}
            width={w}
            height={w * 0.75}
            preserveAspectRatio="xMidYMax meet"
          />
        );
      })}
      {stage === 4 ? (
        <g transform="translate(130 92)" className="gp-pop">
          <rect x="-46" y="-9" width="92" height="16" rx="3" fill="#8d5a2b" stroke="#6e4520" />
          <text x="0" y="2" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff6e4">
            🐾 Every Paw Has a Warm Home!
          </text>
        </g>
      ) : null}
    </>
  );
}

/* ── Starry Night Campfire ────────────────────────────────────── */

function CampfireScene({ stage }: { stage: ProgressStage }) {
  const fw = (FIRE_RING.w / 100) * 320 * (stage === 4 ? 1.25 : 1);
  return (
    <>
      <image href="/images/campfire/campfire-bg.jpg" x="0" y="0" width="320" height="180" preserveAspectRatio="xMidYMid slice" />
      {CAMPFIRE_SPRITES.filter((s) => stage >= s.from).map((s) => {
        const w = (s.w / 100) * 320;
        return (
          <image
            key={s.id}
            className="gp-pop"
            href={s.src}
            x={(s.x / 100) * 320 - w / 2}
            y={(s.y / 100) * 180 - w * 0.75}
            width={w}
            height={w * 0.75}
            preserveAspectRatio="xMidYMax meet"
          />
        );
      })}
      {stage >= 1 ? (
        <image
          className="gp-pop"
          href="/images/campfire/camp-flame.png"
          x={160 - fw / 2}
          y={(FIRE_RING.y / 100) * 180 - fw}
          width={fw}
          height={fw}
          preserveAspectRatio="xMidYMax meet"
        />
      ) : null}
      {stage >= 3
        ? [40, 70, 100, 230, 260, 290].map((x, i) => <circle key={x} cx={x} cy={46 + (i % 3) * 6} r="1.6" fill="#ffd36b" className="gp-flicker" />)
        : null}
      {stage === 4 ? (
        <g transform="translate(160 104)" className="gp-pop">
          <rect x="-62" y="-9" width="124" height="15" rx="3" fill="#8d5a2b" stroke="#6e4520" />
          <text x="0" y="1.5" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff6e4">
            ✨ The Campfire Is Lit! Thank You!
          </text>
        </g>
      ) : null}
    </>
  );
}

/* ── Castle Workshop ──────────────────────────────────────────── */

function CastleScene({ stage }: { stage: ProgressStage }) {
  return (
    <>
      <image
        key={stage}
        className="gp-pop"
        href={CASTLE_STAGE_IMAGES[stage]}
        x="0"
        y="0"
        width="320"
        height="180"
        preserveAspectRatio="xMidYMid slice"
      />
      {stage === 4 ? (
        <g transform="translate(205 76)" className="gp-pop">
          <rect x="-60" y="-9" width="120" height="15" rx="3" fill="#b3261e" stroke="#7d1a14" />
          <text x="0" y="1.5" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff6e4">
            🏰 Castle Complete! Thank You!
          </text>
        </g>
      ) : null}
    </>
  );
}

/* ── Widget ───────────────────────────────────────────────────── */

function Scene({ type, stage, shown }: { type: Exclude<ProgressWidget, "none">; stage: ProgressStage; shown: number }) {
  const scenes: Record<Exclude<ProgressWidget, "none">, ReactNode> = {
    tree: <TreeScene stage={stage} />,
    race: <RaceScene stage={stage} shown={shown} />,
    shelter: <ShelterScene stage={stage} />,
    campfire: <CampfireScene stage={stage} />,
    castle: <CastleScene stage={stage} />,
    rocket: <RocketScene stage={stage} shown={shown} />,
    cake: <CakeScene stage={stage} />,
  };
  return scenes[type];
}

export function CampaignGamifiedProgress({
  type,
  currentAmount,
  targetAmount,
  goalType = "amount",
  compact = false,
  sceneOnly = false,
  className = "",
}: Props) {
  const percent = progressPercent(currentAmount, targetAmount);
  const stage = stageFor(percent);
  const shown = useTweened(percent);
  const label = stageLabel(type, stage);

  const [seenStage, setSeenStage] = useState(stage);
  const [burst, setBurst] = useState(0);
  const [settledBurst, setSettledBurst] = useState(0);
  if (stage !== seenStage) {
    if (stage > seenStage) setBurst((b) => b + 1);
    setSeenStage(stage);
  }
  const celebrating = burst !== settledBurst;
  useEffect(() => {
    if (!celebrating) return;
    const t = window.setTimeout(() => setSettledBurst(burst), 2400);
    return () => window.clearTimeout(t);
  }, [celebrating, burst]);

  const rounded = Math.floor(percent);

  return (
    <div
      data-widget={type}
      data-stage={stage}
      className={`relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm ${className}`}
    >
      {type !== "none" ? (
        <div className="relative">
          <svg viewBox="0 0 320 180" className="gp-scene block h-auto w-full" role="img" aria-label={`${label}. ${rounded}% of goal.`}>
            <Scene type={type} stage={stage} shown={shown} />
          </svg>
          {stage === 4 ? <Confetti loop /> : null}
          {celebrating ? <Confetti key={burst} /> : null}
          {celebrating && !compact ? (
            <p
              role="status"
              className="gp-unlock absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] font-bold text-[var(--color-primary)] shadow-[var(--shadow-md)]"
            >
              🎉 New milestone unlocked!
            </p>
          ) : null}
        </div>
      ) : null}

      {sceneOnly ? null : compact ? (
        <p className="px-3 py-2 text-xs font-medium text-[var(--color-text-muted)]">
          {rounded}% · {label}
        </p>
      ) : (
        <div className="space-y-2.5 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[22px] font-bold leading-none">
              <span data-testid="progress-percent">{rounded}%</span>
              <span className="ml-1.5 text-sm font-semibold text-[var(--color-text-muted)]">{stage === 4 ? "goal reached" : "of goal"}</span>
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">{formatGoalValue(goalType, currentAmount)}</span> of{" "}
              {formatGoalValue(goalType, targetAmount)}
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>
            <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${shown}%` }} />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          {type === "none" && celebrating ? (
            <p role="status" className="gp-unlock text-sm font-bold text-[var(--color-primary)]">
              🎉 New milestone unlocked!
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
