// 夜空背景グラデ。寒色→暖色は必ず紫を経由する(color-design §4)実装済み。
// dawn(0→1) で「夜明け型」カラーアーク(color-design §3)を1propで操作できる。
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {palette} from '../lib/knj-theme';

export const KnjGradientBackdrop: React.FC<{
  dawn?: number; // 0=深夜(midnight基調) → 1=夜明け(amber混入)
  accent?: string; // 下辺に滲む感情色。サビで neonRose を強める等
  accentStrength?: number; // 0-1
}> = ({dawn = 0, accent = palette.neonRose, accentStrength = 0.15}) => {
  const amberOpacity = interpolate(dawn, [0, 1], [0, 0.55]);
  return (
    <AbsoluteFill>
      {/* 基調: 夜空 */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${palette.midnight} 0%, ${palette.midnight2} 55%, ${palette.bridgePurple} 100%)`,
        }}
      />
      {/* 感情色: 地平線から滲む */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${accent} 0%, transparent 45%)`,
          opacity: accentStrength,
          mixBlendMode: 'screen',
        }}
      />
      {/* 夜明け: dawnAmber は紫経由で夜空に混ざる */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${palette.dawnAmber} 0%, ${palette.bridgePurple}00 60%)`,
          opacity: amberOpacity,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
