// サビ点火エフェクト。白フラッシュ(chorus-impact #1)+シェイク(#4)+RGB分離(#6)を1つに。
// 子にサビのシーンを渡し、igniteSec にサビ開始秒を指定するだけで「点火」する。
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

export const KnjChorusBurst: React.FC<{
  igniteSec: number;
  flash?: number; // 白フラッシュ強度 0-1
  shake?: number; // シェイク振幅(px)。0で無効
  rgbSplit?: number; // RGB分離量(px)。0で無効
  children: React.ReactNode;
}> = ({igniteSec, flash = 1, shake = 18, rgbSplit = 5, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - Math.round(igniteSec * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  // 白フラッシュ: 2フレーム点灯→6フレームで減衰
  const flashOpacity =
    local >= 0 ? flash * interpolate(local, [0, 2, 8], [1, 1, 0], clamp) : 0;

  // 減衰シェイク: 12フレームで収束 (camera-work #39)
  const amp = local >= 0 ? shake * interpolate(local, [0, 12], [1, 0], clamp) : 0;
  const sx = amp * (random(`cb-x-${local}`) - 0.5) * 2;
  const sy = amp * 0.6 * (random(`cb-y-${local}`) - 0.5) * 2;

  // RGB分離: 頭4フレームのみ。赤チャンネルと緑青チャンネルを逆方向へずらしscreen合成で再構成
  const split = local >= 0 && local < 4 ? rgbSplit * (1 - local / 4) : 0;

  const content = (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>{children}</AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      {split > 0 ? (
        <AbsoluteFill style={{background: '#000'}}>
          <svg width="0" height="0" style={{position: 'absolute'}}>
            <filter id="knj-ch-r">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
            </filter>
            <filter id="knj-ch-gb">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              />
            </filter>
          </svg>
          <AbsoluteFill
            style={{
              transform: `translate(${-split}px, 0)`,
              filter: 'url(#knj-ch-r)',
              mixBlendMode: 'screen',
            }}
          >
            {content}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `translate(${split}px, 0)`,
              filter: 'url(#knj-ch-gb)',
              mixBlendMode: 'screen',
            }}
          >
            {content}
          </AbsoluteFill>
        </AbsoluteFill>
      ) : (
        content
      )}
      {flashOpacity > 0 ? (
        <AbsoluteFill style={{background: '#fff', opacity: flashOpacity, pointerEvents: 'none'}} />
      ) : null}
    </AbsoluteFill>
  );
};
