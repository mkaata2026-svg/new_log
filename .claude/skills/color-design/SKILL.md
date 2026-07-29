---
name: color-design
description: MVの色彩設計理論。感情と色の対応、配色スキーム、シーン間の色のアーク設計、KNJYKKI公式パレットの運用、Remotionでのカラーグレーディング実装。色決め・グレーディング作業時に必ず参照する。
---

# 色彩設計

## 1. 色は「感情の予告編」である

視聴者は構図より先に色を読む。**シーンの感情は、被写体が演技する前に色が伝えてしまう**。
だから色設計はシーン実装の前、絵コンテ段階で決める。

### 感情→色 対応表(西洋理論+日本的感覚の折衷)

| 感情 | 主色 | 補助 | 備考 |
|---|---|---|---|
| 切なさ・郷愁 | 琥珀/オレンジ (#FFB86B) | 褪せた青 | 夕暮れ・白熱灯の記憶色 |
| 孤独・冷静 | 青緑/シアン (#4CC9F0) | 無彩色 | 深夜・モニター光 |
| 恋・衝動 | ネオンピンク (#FF4D6D) | 深紫 | 血色+人工光の二面性 |
| 希望・朝 | 薄水色→白金 | 淡桃 | 彩度は低く、明度で語る |
| 不安・違和 | 黄緑/病的な黄 | 濁った紫 | 自然界の警告色 |
| 喪失 | 無彩色(彩度0.1以下) | 一点だけ有彩色 | 「残った色」が主役 |
| 決意・熱 | 深紅 | 黒 | 面積は小さく強く |
| 神聖・超越 | 白+金 | 淡青 | ラスサビの最終到達色 |

## 2. 配色スキーム(画面をどう塗り分けるか)

- **60-30-10の法則** — 基調60% / 補助30% / 強調10%。強調10%が歌詞やキーライトになる。
- **補色分裂(Split Complementary)** — KNJYKKI標準。Midnight基調に対し Neon Rose と Dawn Amber を対置。ビビッドな対立を避けつつ緊張感を保つ。
- **類似色(Analogous)** — 青〜紫〜ピンクの隣接。夜のシーンの安全牌。単調になったら明度差で救う。
- **単色+突破色(Monochrome + Accent)** — 全部青の世界に赤い傘1つ。視線誘導の最終兵器。1曲2回まで。
- **禁じ手** — 高彩度の3色以上の等量配置(祭りになる)。純黒 #000 と純白 #FFF(必ず色味を混ぜる: 黒は #0B0E1A、白は #F5F3F0)。

## 3. 色のアーク(曲構成×色の設計)

色は静的なパレットではなく**時間軸上の物語**として設計する。

```
定番アーク「夜明け型」(KNJYKKI基本形):
intro   Midnight 95% + Cyan 5%          (まだ夜)
verseA  Midnight 80% + Cyan 15% + Rose 5%
verseB  Rose が 15% に侵食              (感情の兆し)
chorus  Rose 35% + ブルーム              (感情の点灯)
bridge  彩度を一度 0.3 まで落とす         (夜明け前が一番暗い)
last-chorus Amber が初登場し 30%         (夜明け)
outro   Amber→白金へ溶ける               (朝)
```

- **ルール1: 最重要色は最後まで取っておく。** 上例では Amber がラスサビまで封印されている。
- **ルール2: セクション境界で色相を30°以上動かすなら、トランジションに「口実」を持たせる**(照明が替わる、場所が変わる等)。
- **ルール3: 彩度の総和は右肩上がりにしない。** ブリッジで一度落とすから、ラスサビが最高到達点になれる。

## 4. KNJYKKI公式パレット運用

`scene-library/lib/knj-theme.ts` の `palette` を必ずimportして使う。HEX直書き禁止。

| 名前 | HEX | 役割 | 使用面積目安 |
|---|---|---|---|
| midnight | #0B0E1A | 背景・闇 | 50-70% |
| midnight2 | #141A2E | 背景の階調・パネル | 10-20% |
| neonRose | #FF4D6D | 感情・強調・サビ | 5-35%(サビで拡大) |
| cyanAsh | #4CC9F0 | 冷静・デジタル・Aメロ | 5-15% |
| dawnAmber | #FFB86B | 郷愁・希望・ラスサビ | 0-30%(終盤解禁) |
| ghostWhite | #F5F3F0 | 文字・光 | 5-10% |

グラデーションの定石: `midnight → #1A0F2E(紫の中間色) → neonRose`。**寒色と暖色を直接つながず、必ず紫を経由させる**と夜空が濁らない。

## 5. Remotionでのグレーディング実装

### レイヤー方式(推奨) — 最上段に Grade レイヤーを1枚
```tsx
// 基本形: foundations §7 の Grade を使う
<Grade filter="saturate(0.92) contrast(1.06) brightness(0.98)" grain={0.06} vignette={0.45} />
```

### セクション連動グレード
```tsx
const sat = interpolate(frame, [chorusStart - 30, chorusStart], [0.9, 1.15], {clamp});
// サビ30フレーム前から彩度を滑らかに上げる。サビ頭で階段的に上げるより上質
```

### 色被せ(カラーキャスト) — 画面全体を感情色に寄せる
```tsx
<AbsoluteFill style={{background: palette.neonRose, opacity: 0.08, mixBlendMode: 'overlay'}} />
// soft-light: さらに弱く / color: モノクロ化+着色(デュオトーンの土台)
```

### デュオトーン — 2色刷り。間奏・回想の武器
```tsx
<AbsoluteFill style={{filter: 'grayscale(1) contrast(1.1)'}}>{scene}</AbsoluteFill>
<AbsoluteFill style={{background: `linear-gradient(${palette.midnight}, ${palette.neonRose})`,
  mixBlendMode: 'color', pointerEvents: 'none'}} />
```

### SVG feColorMatrix — チャンネル演算が要る時(ティール&オレンジ等)
```tsx
<filter id="teal-orange">
  <feColorMatrix type="matrix" values="1.06 0 0 0 0.02  0 1.0 0 0 0.01  0 0 0.92 0 0.04  0 0 0 1 0" />
</filter>  // シャドウに青、ハイライトに橙を寄せる近似。style={{filter:'url(#teal-orange)'}}
```

### 時制の色分け(mv-direction §69 対比モンタージュ用)
- 過去: `sepia(0.35) saturate(0.8)` + Amberキャスト + グレイン2倍
- 現在: `saturate(0.95)` + Cyanキャスト
- 未来/仮定: `contrast(0.9) brightness(1.1)` + 白キャスト(飛ばし気味)

## 6. 品質チェック

- [ ] HEX直書きがない(`knj-theme.ts` 経由)
- [ ] 純黒・純白を使っていない
- [ ] サビとAメロで彩度差が体感できる(スクショ2枚並べて確認)
- [ ] 最重要色(通常 dawnAmber)が前半で漏れていない
- [ ] 歌詞の可読性: 文字色と背景のコントラスト比が実効4.5:1以上(発光で救うのは可)
