// BPM→フレーム変換ヘルパー。音楽同期はフレーム直打ち禁止、必ずここを経由する (CLAUDE.md 規約4)

export type Timing = {
  beatDur: number;
  barDur: number;
  sec: (s: number) => number;
  beat: (n: number) => number;
  bar: (n: number) => number;
  beatPhase: (frame: number) => number;
};

export const makeTiming = (bpm: number, fps: number, offsetSec = 0): Timing => {
  const beatDur = (60 / bpm) * fps; // 1拍のフレーム数
  return {
    beatDur,
    barDur: beatDur * 4,
    sec: (s: number) => s * fps,
    beat: (n: number) => offsetSec * fps + n * beatDur,
    bar: (n: number) => offsetSec * fps + n * beatDur * 4,
    // いま何拍目か(小数)。ビート同期エフェクトの位相に使う
    beatPhase: (frame: number) => (frame - offsetSec * fps) / beatDur,
  };
};

// 拍頭パルス: 拍頭で peak、attack(0-1指定)で戻る。scale等に掛ける
export const beatPulse = (phase: number, peak = 1.06, attack = 0.15): number => {
  const p = ((phase % 1) + 1) % 1;
  if (p >= attack) return 1;
  return peak - ((peak - 1) * p) / attack;
};
