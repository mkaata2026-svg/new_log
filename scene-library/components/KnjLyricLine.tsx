// 文字stagger歌詞表示。lyrics-animationの主要出現パターンをmodeで切替。
// タイミングは秒で受け取り、フレーム換算はこの表示層で行う (CLAUDE.md 規約)
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, palette, springs} from '../lib/knj-theme';

export type LyricWord = {text: string; startSec: number; endSec: number};

export type LyricMode = 'fade' | 'rise' | 'blur' | 'pop' | 'karaoke';

export const KnjLyricLine: React.FC<{
  words: LyricWord[];
  endSec: number; // 行の消滅開始秒
  mode?: LyricMode;
  staggerFrames?: number; // 文字遅延。KNJYKKI標準=2
  fontSize?: number;
  color?: string;
  accentColor?: string; // karaokeの未発音側など
  style?: React.CSSProperties;
}> = ({
  words,
  endSec,
  mode = 'rise',
  staggerFrames = 2,
  fontSize = 48,
  color = palette.ghostWhite,
  accentColor = palette.neonRose,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 行全体の消滅(出現と対称のフェード)
  const outP = spring({frame: frame - endSec * fps, fps, config: springs.knj});
  const lineOpacity = 1 - outP;
  if (lineOpacity <= 0) return null;

  const base: React.CSSProperties = {
    fontFamily: fonts.jpSerif,
    fontSize,
    letterSpacing: '0.06em',
    color,
    display: 'flex',
    flexWrap: 'wrap',
    opacity: lineOpacity,
    ...style,
  };

  const chars = words.flatMap((w) =>
    [...w.text].map((c, ci, arr) => ({
      c,
      // 単語内の文字にも発音区間を等分して割り当てる(karaoke用)
      startSec: w.startSec + ((w.endSec - w.startSec) * ci) / arr.length,
      wordStartSec: w.startSec,
    })),
  );

  return (
    <div style={base}>
      {chars.map((ch, i) => {
        const local = frame - ch.wordStartSec * fps - i * staggerFrames;
        const p = spring({frame: local, fps, config: springs.knj});
        let s: React.CSSProperties = {};
        switch (mode) {
          case 'fade':
            s = {opacity: p};
            break;
          case 'rise':
            s = {opacity: p, transform: `translateY(${(1 - p) * 20}px)`};
            break;
          case 'blur':
            s = {opacity: p, filter: `blur(${(1 - p) * 12}px)`};
            break;
          case 'pop':
            s = {opacity: p, transform: `scale(${0.8 + p * 0.2})`};
            break;
          case 'karaoke': {
            // 発音済み=color / 未発音=accentColor薄表示 (lyrics-animation #6の文字単位近似)
            const sung = frame >= ch.startSec * fps;
            s = {opacity: sung ? 1 : 0.35, color: sung ? color : accentColor};
            break;
          }
        }
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', ...s}}>
            {ch.c}
          </span>
        );
      })}
    </div>
  );
};

// 表示中の強調ユーティリティ: ビート明滅 (lyrics-animation #27)
export const beatBlink = (phase: number): number =>
  interpolate(((phase % 1) + 1) % 1, [0, 0.1, 0.25, 1], [1, 0.85, 1, 1]);
