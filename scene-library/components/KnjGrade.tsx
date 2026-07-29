// 最終グレーディング層。グレイン+ビネット+CSSフィルタ。必ずレイヤー最上段に置く。
// KNJYKKI質感署名(docs/brand-knjykki.md §5)の実装。
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {texture} from '../lib/knj-theme';

export const KnjGrade: React.FC<{
  filter?: string; // 例: 'saturate(1.15) contrast(1.06)' サビ用
  grain?: number;
  vignette?: number;
  tint?: string; // カラーキャスト色。省略で無し
  tintOpacity?: number;
}> = ({
  filter = 'saturate(0.92) contrast(1.05)',
  grain = texture.grainOpacity,
  vignette = texture.vignette,
  tint,
  tintOpacity = 0.08,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backdropFilter: filter}} />
      {tint ? (
        <AbsoluteFill style={{background: tint, opacity: tintOpacity, mixBlendMode: 'overlay'}} />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      <svg width="100%" height="100%" style={{opacity: grain, mixBlendMode: 'overlay'}}>
        <filter id="knj-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 60} />
        </filter>
        <rect width="100%" height="100%" filter="url(#knj-grain)" />
      </svg>
    </AbsoluteFill>
  );
};
