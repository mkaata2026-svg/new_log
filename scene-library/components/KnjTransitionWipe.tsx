// ソフトエッジワイプ (transitions #28)。境界にグラデ帯を持つ上品な場面転換。
// progress(0→1) を親から渡す設計(TransitionShellイディオム)。ビート量子化した尺で使うこと。
import React from 'react';
import {AbsoluteFill} from 'remotion';

type Dir = 'left' | 'right' | 'up' | 'down';

const ANGLE: Record<Dir, string> = {
  right: '90deg',
  left: '270deg',
  down: '180deg',
  up: '0deg',
};

export const KnjTransitionWipe: React.FC<{
  progress: number; // 0=シーンAのみ → 1=シーンBのみ
  direction?: Dir;
  softness?: number; // 境界グラデ帯の幅(0-0.5)
  sceneA: React.ReactNode;
  sceneB: React.ReactNode;
}> = ({progress, direction = 'right', softness = 0.12, sceneA, sceneB}) => {
  // マスク位置: progressに応じてグラデ境界を画面外→画面外へ走らせる
  const p = Math.min(1, Math.max(0, progress));
  const edge = p * (1 + softness * 2) - softness;
  const from = (edge - softness) * 100;
  const to = (edge + softness) * 100;
  const mask = `linear-gradient(${ANGLE[direction]}, black ${from}%, transparent ${to}%)`;

  return (
    <AbsoluteFill>
      <AbsoluteFill>{sceneB}</AbsoluteFill>
      <AbsoluteFill
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {sceneA}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
