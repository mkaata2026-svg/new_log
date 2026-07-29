# KNJYKKI × Remotion — MV制作システム憲法 (Master Guide v1.0)

このリポジトリは **KNJYKKI** のミュージックビデオを Remotion で量産・蓄積するための制作システムである。
単発のMVを作る場所ではなく、**制作を重ねるほど「KNJYKKIらしい映像言語」が蓄積される工場**として設計されている。

## 3層アーキテクチャ

| 層 | 場所 | 役割 | 読み込み |
|---|---|---|---|
| 1. 憲法 | `CLAUDE.md`(本書) | ブランド核・規約・ワークフロー | 常時 |
| 2. スキル | `.claude/skills/` | 演出パターン辞典・理論 | タスクに応じて自動 |
| 3. シーンライブラリ | `scene-library/` | 実戦投入済みの再利用コンポーネント | import して使用 |

### スキル振り分けルール(どの作業で何を読むか)

| 作業内容 | 読むべきスキル |
|---|---|
| 新規MVの企画・絵コンテ | `mv-direction` + `emotional-psychology` + `docs/brand-knjykki.md` |
| カメラの動きの設計・実装 | `camera-work` |
| 歌詞・タイポグラフィの実装 | `lyrics-animation` |
| サビ・ドロップの演出強化 | `chorus-impact` + `emotional-psychology` |
| シーン間のつなぎ | `transitions` |
| 色決め・グレーディング | `color-design` |
| 構図・ライティングの検討 | `cinematography` |
| Remotionの実装全般・音同期 | `remotion-foundations` |

ユーザーへの指示テンプレートは `docs/claude-code-prompts.md` にある。
KNJYKKIブランドの完全版は `docs/brand-knjykki.md` にある。

---

## KNJYKKI ブランド核(要約 — 全実装で常に適用)

> 完全版: `docs/brand-knjykki.md`

- **世界観キーワード**: 夜明け前 / 都市の孤独 / ネオンの残光 / 郷愁とデジタルの同居 / 「終わりかけの夜が一番きれい」
- **基調パレット** (`scene-library/lib/knj-theme.ts` に定義):
  - Midnight `#0B0E1A` / Neon Rose `#FF4D6D` / Cyan Ash `#4CC9F0` / Dawn Amber `#FFB86B` / Ghost White `#F5F3F0`
- **モーション署名**: 立ち上がりは重く(ease-out強め)、減衰は長く。バネは `damping: 200` 基準の「粘る」動き。パキパキした等速移動は禁止。
- **質感署名**: 常に微量のフィルムグレイン + ビネット。完璧すぎる画面は KNJYKKI ではない。
- **タイポ署名**: 日本語は明朝系を主役、英語はコンデンスドサンセリフ。歌詞は画面の「余白」に置く。
- **NG**: 原色ベタ塗り / コミカルなバウンス / レインボーグラデ / Comic Sans 系 / 画面中央ど真ん中の歌詞常設

---

## Remotion コーディング規約

### プロジェクト標準
- 解像度 **1920×1080 / 30fps** を基本(縦型は 1080×1920)。`durationInFrames` は必ず楽曲長から算出。
- コンポーネント名は `Knj` プレフィックス(例: `KnjChorusBurst`)。1ファイル1コンポーネント。
- MVごとに `src/videos/<slug>/` を切り、共通化できたものだけを `scene-library/` に昇格させる。

### アニメーション原則
1. **すべて `useCurrentFrame()` 駆動**。CSS transition / animation は禁止(レンダリング非決定になる)。
2. `interpolate` には必ず `extrapolateLeft/Right: "clamp"` を付ける(意図的な外挿を除く)。
3. 乱数は `random(seed)`(Remotion組み込み)のみ。`Math.random()` 禁止。
4. **音楽同期はフレーム直打ち禁止**。`scene-library/lib/timing.ts` の BPM ヘルパー(`beat()`, `bar()`, `sec()`)経由で書く。
5. spring は `config: {damping: 200}` を基準に、用途別プリセット(`knj-theme.ts` の `springs`)を使う。
6. 重い計算は `useMemo`、パーティクル等は決定論的に(フレーム番号から状態を純関数で導出)。

### 音楽・歌詞データ
- 楽曲メタは `src/videos/<slug>/song.ts` に集約: `bpm`, `offsetSec`(曲頭無音), `sections`(intro/verse/chorus…の開始秒), `lyrics`(行・単語・開始/終了秒)。
- 歌詞スキーマは `remotion-foundations` スキル参照。**歌詞タイミングは秒で持ち、フレーム換算は表示層で行う。**

### レビュー基準(マージ前チェックリスト)
- [ ] ブランドNG項目に抵触していない
- [ ] サビは Aメロ比で「情報量・彩度・カット率」のうち2つ以上が上がっている(`chorus-impact` 参照)
- [ ] トランジションが「意味」を持っている(場面転換の理由がある)
- [ ] グレイン+ビネットが乗っている
- [ ] `npx remotion render` が警告なしで通る

---

## 制作ワークフロー

```
1. 企画        楽曲を聴く → sections/BPM/感情曲線をsong.tsに書き起こす
2. 絵コンテ    mv-directionスキルからパターンを選定し、セクション×演出の対応表を作る
3. シーン分解  1シーン=1コンポーネントに分解、scene-libraryから再利用できる物を先に確保
4. 実装        規約に従い実装。カメラ→背景→主役→歌詞→グレーディングの順に重ねる
5. レビュー    上記チェックリスト + Remotion Studioで通し確認
6. 蓄積        新規に生まれた汎用演出をscene-library/に昇格し、registry.mdに登録
```

**ステップ6を絶対に省略しない。** これがこのシステムの存在理由である。
昇格手順は `scene-library/README.md` に従う。

## 蓄積ルール(要約)

- 2本以上のMVで使い回せる見込みがある演出 → `scene-library/components/` へ昇格
- 昇格時は `scene-library/registry.md` に「名前 / 分類 / 使用MV / 一言説明」を1行追加
- MV完成ごとに `docs/mv-log/<slug>.md` に「使った演出・うまくいった点・次回への学び」を記録
