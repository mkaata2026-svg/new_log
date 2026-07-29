// KNJYKKI ブランド定数。色・モーション・フォントの唯一の正。
// HEX直書き禁止 — 必ずここから import する (docs/brand-knjykki.md §2)

export const palette = {
  midnight: '#0B0E1A',
  midnight2: '#141A2E',
  neonRose: '#FF4D6D',
  cyanAsh: '#4CC9F0',
  dawnAmber: '#FFB86B',
  ghostWhite: '#F5F3F0',
  // 寒色→暖色の橋渡し用中間紫 (color-design §4「必ず紫を経由」)
  bridgePurple: '#1A0F2E',
} as const;

// spring プリセット (remotion-foundations §9)
export const springs = {
  knj: {damping: 200},                    // 標準。粘る、上品
  heavy: {damping: 300, stiffness: 60},   // 大型オブジェクトの入場
  snap: {damping: 20, stiffness: 200},    // サビのアタック(多用禁止)
  breath: {damping: 40, stiffness: 20},   // ゆったりした呼吸的往復
} as const;

export const fonts = {
  jpSerif: "'Shippori Mincho', 'Noto Serif JP', serif",
  enCondensed: "'Oswald', 'Barlow Condensed', sans-serif",
} as const;

// 質感署名の標準値 (docs/brand-knjykki.md §5)
export const texture = {
  grainOpacity: 0.06,
  vignette: 0.45,
} as const;
