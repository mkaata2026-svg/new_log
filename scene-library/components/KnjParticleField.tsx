// 決定論的パーティクル。フレーム番号とseedから純関数で位置を導出(状態レス)。
// mode: rain(雨) / snow(雪) / dust(塵・浮遊) / ember(上昇する光。ラスサビの金粒子雨は color=dawnAmber)
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {palette} from '../lib/knj-theme';

type Mode = 'rain' | 'snow' | 'dust' | 'ember';

const CONF: Record<Mode, {speed: number; drift: number; w: number; h: number; up: boolean}> = {
  rain: {speed: 14, drift: 1.5, w: 1.5, h: 18, up: false},
  snow: {speed: 1.2, drift: 8, w: 4, h: 4, up: false},
  dust: {speed: 0.25, drift: 4, w: 3, h: 3, up: false},
  ember: {speed: 1.8, drift: 6, w: 3, h: 3, up: true},
};

export const KnjParticleField: React.FC<{
  mode?: Mode;
  count?: number;
  color?: string;
  seed?: string;
  opacity?: number; // 全体の最大不透明度
}> = ({mode = 'dust', count = 60, color = palette.ghostWhite, seed = 'pf', opacity = 0.6}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const c = CONF[mode];

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const rx = random(`${seed}-x${i}`);
        const ry = random(`${seed}-y${i}`);
        const rs = 0.4 + random(`${seed}-s${i}`) * 0.6; // 個体差(速度・サイズ)
        const travel = frame * c.speed * rs;
        const rawY = ry * height + (c.up ? -travel : travel);
        const y = ((rawY % (height + 60)) + height + 60) % (height + 60) - 30;
        const x =
          rx * width + Math.sin(frame * 0.02 + ry * 30) * c.drift * (0.5 + rs);
        const o = opacity * (0.3 + random(`${seed}-o${i}`) * 0.7);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: c.w * rs,
              height: c.h * rs,
              borderRadius: c.w,
              background: color,
              opacity: o,
              boxShadow: mode === 'ember' ? `0 0 ${6 * rs}px ${color}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
