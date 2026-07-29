// 2.5Dカメラ土台。シーン全体を包み、cam値の逆変換でカメラワークを表現する。
// 全camera-workパターンの実行基盤。breathe>0 で「呼吸ノイズ」(camera-work #31)を内蔵合成。
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

export type Cam = {
  x?: number; // 右へ振る(px)
  y?: number; // 下へ振る(px)
  z?: number; // 0=等倍, 正で寄る (scale = 1 + z)
  rotate?: number; // ロール(deg)
  tiltX?: number; // 縦あおり(deg)
  tiltY?: number; // 横あおり(deg)
};

const noise = (frame: number, seed: string, hz: number): number =>
  Math.sin(frame * hz * 0.1 + random(seed) * 100) +
  Math.sin(frame * hz * 0.23 + random(seed + 'b') * 100);

export const KnjCameraRig: React.FC<{
  cam?: Cam;
  breathe?: number; // 呼吸ノイズ振幅(px)。0=なし, 3=KNJYKKI標準, 20=粗い手持ち
  perspective?: number;
  children: React.ReactNode;
}> = ({cam = {}, breathe = 0, perspective = 1200, children}) => {
  const frame = useCurrentFrame();
  const bx = breathe * noise(frame, 'knj-cam-x', 1);
  const by = breathe * 0.7 * noise(frame, 'knj-cam-y', 1.3);
  const br = breathe * 0.02 * noise(frame, 'knj-cam-r', 0.7);

  return (
    <AbsoluteFill style={{perspective, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: [
            `translate3d(${-((cam.x ?? 0) + bx)}px, ${-((cam.y ?? 0) + by)}px, 0)`,
            `scale(${1 + (cam.z ?? 0)})`,
            `rotate(${-((cam.rotate ?? 0) + br)}deg)`,
            `rotateX(${cam.tiltX ?? 0}deg)`,
            `rotateY(${cam.tiltY ?? 0}deg)`,
          ].join(' '),
          transformOrigin: '50% 50%',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
