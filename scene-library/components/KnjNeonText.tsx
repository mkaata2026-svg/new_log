// ネオン管テキスト。点灯シーケンス(2回瞬いてから点く)・故障明滅・ブルームを内蔵。
// ネオンの物理(docs/brand-knjykki.md §4)の標準実装。
import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, palette} from '../lib/knj-theme';

export const KnjNeonText: React.FC<{
  text: string;
  igniteSec?: number; // この秒に点灯シーケンス開始
  color?: string;
  fontSize?: number;
  flicker?: boolean; // 故障明滅(Aメロ/ブリッジ向け。サビではfalse推奨)
  seed?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  igniteSec = 0,
  color = palette.neonRose,
  fontSize = 72,
  flicker = true,
  seed = 'neon',
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - igniteSec * fps;

  // 点灯シーケンス: 暗→瞬1→暗→瞬2→半点灯→全点灯 (12フレーム)
  let on = 0;
  if (local >= 12) on = 1;
  else if (local >= 0) on = [0, 0, 1, 0, 0, 1, 0, 0.3, 0.3, 0.6, 0.6, 1][local] ?? 0;

  // 故障明滅: 3フレームごとに8%の確率で暗落ち (cinematography B-5)
  const drop =
    flicker && on === 1 && random(`${seed}-${Math.floor(frame / 3)}`) > 0.92 ? 0.55 : 1;
  const glow = on * drop;

  return (
    <div
      style={{
        fontFamily: fonts.enCondensed,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.12em',
        color: glow > 0 ? color : `${color}33`,
        opacity: 0.25 + glow * 0.75,
        textShadow:
          glow > 0
            ? `0 0 ${8 * glow}px ${color}, 0 0 ${28 * glow}px ${color}, 0 0 ${64 * glow}px ${color}88`
            : 'none',
        ...style,
      }}
    >
      {text}
    </div>
  );
};
