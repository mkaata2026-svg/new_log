---
name: remotion-foundations
description: RemotionでのMV実装の基盤テンプレート集。プロジェクト構成、音楽同期(BPM/ビート/歌詞)、カメラリグ、パーティクル、グレーディング、レンダリングまで、KNJYKKI MVの実装で共通する土台をすべて含む。Remotionコードを書く前に必ず参照する。
---

# Remotion 実装基盤テンプレート集

## 1. プロジェクト構成

```
src/
  Root.tsx                 # 全Compositionの登録
  videos/
    <slug>/                # MV 1本 = 1ディレクトリ
      index.tsx            # そのMVのメインComposition
      song.ts              # 楽曲メタデータ(BPM/セクション/歌詞)
      scenes/              # このMV固有のシーン
scene-library/             # MV横断の共有ライブラリ(リポジトリルート)
  components/  lib/  hooks/
```

Composition 登録テンプレート:

```tsx
// src/Root.tsx
import {Composition} from 'remotion';
import {MyMv} from './videos/my-mv';
import {song} from './videos/my-mv/song';

export const RemotionRoot = () => (
  <Composition
    id="my-mv"
    component={MyMv}
    durationInFrames={Math.ceil(song.durationSec * 30)}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

## 2. 楽曲メタデータ (song.ts スキーマ)

```ts
export type Section = {
  name: 'intro' | 'verseA' | 'verseB' | 'preChorus' | 'chorus' | 'bridge' | 'outro' | string;
  startSec: number;
};
export type LyricWord = {text: string; startSec: number; endSec: number};
export type LyricLine = {words: LyricWord[]; startSec: number; endSec: number};

export const song = {
  slug: 'my-mv',
  audioSrc: staticFile('audio/my-mv.mp3'),
  durationSec: 214,
  bpm: 128,
  offsetSec: 0.35,          // 曲頭の無音。全ビート計算に加算する
  sections: [
    {name: 'intro',  startSec: 0},
    {name: 'verseA', startSec: 15.0},
    {name: 'chorus', startSec: 60.2},
  ] satisfies Section[],
  lyrics: [] as LyricLine[],
};
```

歌詞は秒で保持し、表示層で `sec * fps` に変換する。BPM変更曲は `sections` に `bpm` を持たせ区間ごとに計算。

## 3. タイミングヘルパー (scene-library/lib/timing.ts)

```ts
// beat(n): n拍目のフレーム / bar(n): n小節目のフレーム / sec(s): 秒→フレーム
export const makeTiming = (bpm: number, fps: number, offsetSec = 0) => {
  const beatDur = (60 / bpm) * fps;              // 1拍のフレーム数
  return {
    beatDur,
    barDur: beatDur * 4,
    sec: (s: number) => (s + 0) * fps,
    beat: (n: number) => offsetSec * fps + n * beatDur,
    bar: (n: number) => offsetSec * fps + n * beatDur * 4,
    // いま何拍目か(小数)。ビート同期エフェクトの位相に使う
    beatPhase: (frame: number) => (frame - offsetSec * fps) / beatDur,
  };
};
```

ビート同期パルス(キックに合わせて脈打つ)の定石:

```tsx
const t = makeTiming(song.bpm, fps, song.offsetSec);
const phase = t.beatPhase(frame) % 1;            // 0→1 を1拍で繰り返す
const pulse = interpolate(phase, [0, 0.15, 1], [1.06, 1, 1], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
}); // 拍頭で1.06倍→すぐ戻る
```

## 4. シーケンサー(セクション→シーンの割付)

```tsx
export const SectionSequencer: React.FC<{song: Song; scenes: Record<string, React.FC>}> =
  ({song, scenes}) => {
    const {fps} = useVideoConfig();
    return (
      <>
        {song.sections.map((s, i) => {
          const from = Math.round(s.startSec * fps);
          const next = song.sections[i + 1];
          const dur = Math.round(((next?.startSec ?? song.durationSec) - s.startSec) * fps);
          const Scene = scenes[s.name];
          return Scene ? (
            <Sequence key={i} from={from} durationInFrames={dur} name={s.name}>
              <Scene />
            </Sequence>
          ) : null;
        })}
      </>
    );
  };
```

## 5. カメラリグ(2.5Dカメラの土台)

Remotionに物理カメラはないので、**シーン全体を1つのコンテナに入れ、逆方向に変形する**ことでカメラを表現する。`camera-work` スキルの50パターンはすべてこのリグ上で動く。

```tsx
type Cam = {x?: number; y?: number; z?: number; rotate?: number; tiltX?: number; tiltY?: number};

export const CameraRig: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <AbsoluteFill style={{perspective: 1200, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        transform: [
          `translate3d(${-(cam.x ?? 0)}px, ${-(cam.y ?? 0)}px, 0)`,
          `scale(${1 + (cam.z ?? 0)})`,            // z>0 で寄る
          `rotate(${-(cam.rotate ?? 0)}deg)`,
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
```

パララックス(多層背景)は、各レイヤーに `depth`(0=無限遠, 1=最前面)を持たせ `translate` を `depth` 倍する。

## 6. 決定論的パーティクル

状態を持たず、**フレーム番号とseedから毎フレーム純関数で位置を導出**する。

```tsx
import {random} from 'remotion';

const Particles: React.FC<{count: number; seed: string}> = ({count, seed}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      {Array.from({length: count}).map((_, i) => {
        const rx = random(`${seed}-x${i}`), ry = random(`${seed}-y${i}`);
        const speed = 0.3 + random(`${seed}-s${i}`) * 0.7;
        const y = ((ry * height + frame * speed) % (height + 40)) - 20; // 下へ流れてループ
        const opacity = 0.15 + random(`${seed}-o${i}`) * 0.5;
        return <div key={i} style={{position: 'absolute', left: rx * width, top: y,
          width: 3, height: 3, borderRadius: 2, background: '#F5F3F0', opacity}} />;
      })}
    </AbsoluteFill>
  );
};
```

## 7. グレーディング層(最後に重ねる)

```tsx
export const Grade: React.FC<{filter?: string; grain?: number; vignette?: number}> =
  ({filter = 'saturate(0.92) contrast(1.05)', grain = 0.06, vignette = 0.45}) => {
    const frame = useCurrentFrame();
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <AbsoluteFill style={{backdropFilter: filter}} />
        {/* ビネット */}
        <AbsoluteFill style={{background:
          `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`}} />
        {/* グレイン: SVG turbulence を毎フレーム seed 替えで揺らす */}
        <svg width="100%" height="100%" style={{opacity: grain, mixBlendMode: 'overlay'}}>
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9"
            numOctaves="2" seed={frame % 60} /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    );
  };
```

重ね順の定石: `背景 → 中景 → 主役 → 歌詞 → 光(ブルーム等) → Grade`。

## 8. 音声の扱い

```tsx
<Audio src={song.audioSrc} />                       // 全編BGM
<Audio src={sfx} startFrom={0} volume={(f) =>       // フェードイン付きSFX
  interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'})} />
```

波形・音量反応ビジュアライザは `@remotion/media-utils` の `useAudioData` + `visualizeAudio`。
ただし**サビ演出の主軸を音量反応に頼らない**こと(section定義による設計的な演出が主、音量反応は味付け)。

## 9. spring プリセット (scene-library/lib/knj-theme.ts)

```ts
export const springs = {
  knj:    {damping: 200},                    // 標準。粘る、上品
  heavy:  {damping: 300, stiffness: 60},     // 大型オブジェクトの入場
  snap:   {damping: 20, stiffness: 200},     // サビのアタック(多用禁止)
  breath: {damping: 40, stiffness: 20},      // ゆったりした呼吸的往復
};
```

## 10. レンダリング・プレビュー

```bash
npx remotion studio                      # プレビュー
npx remotion render <id> out/<slug>.mp4  # 本番 (h264, デフォルトcrf)
npx remotion render <id> --frames=900-1050 out/chorus-check.mp4  # サビだけ確認
npx remotion still <id> --frame=450 out/thumb.png                # サムネ抽出
```

パフォーマンス: 1枚絵に焼けるものは `<OffthreadVideo>`/事前レンダに逃がす。blur/backdrop-filterの多重掛けはレンダを激重にするため、サビ以外では2枚まで。
