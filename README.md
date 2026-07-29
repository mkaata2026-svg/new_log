# Remotion Master Guide v1.0 — KNJYKKI MV制作システム

KNJYKKIのミュージックビデオを Remotion で制作・量産し、**作るたびに映像言語を蓄積する**ためのリポジトリ。
Claude Code (Opus 5) と共同制作することを前提に、知識を3層に分けて配置している。

## 全体マップ

```
CLAUDE.md                     ← 第1層: 憲法(常時読み込み)。規約・ブランド核・ワークフロー
.claude/skills/               ← 第2層: 演出辞典(タスクに応じて自動読み込み)
  remotion-foundations/         Remotion実装テンプレート集(音同期・カメラリグ・パーティクル等)
  camera-work/                  映画的カメラワーク 50パターン
  mv-direction/                 MV演出 100パターン
  lyrics-animation/             歌詞アニメーション 80パターン
  chorus-impact/                サビ演出 50パターン
  transitions/                  トランジション 120種類
  color-design/                 色彩設計理論
  cinematography/               ショット構成 & ライティング理論
  emotional-psychology/         エモさを生む映像心理学
scene-library/                ← 第3層: 演出資産(実装コード。MVごとに成長する)
  lib/  components/  registry.md
docs/
  brand-knjykki.md              KNJYKKI 世界観・ブランドガイドライン
  claude-code-prompts.md        Claude Codeへの指示テンプレート集 (T1〜T12)
  mv-log/                       MVごとの制作ログ(完成のたびに追加)
```

## 使い始め方

1. **MVを作る**: `docs/claude-code-prompts.md` の **T1**(新規MV立ち上げ)をコピーして埋め、Claude Codeに貼る。
2. 絵コンテ合意 → **T2** で実装開始 → **T3〜T7** で個別調整 → **T8** レビュー → **T10** レンダ。
3. **完成したら必ず T9**(ライブラリ昇格)。これを繰り返すほど `scene-library/` が育ち、「KNJYKKIらしさ」が資産になる。

## 設計思想

- **単発のプロンプト改善より、構造による蓄積。** パターン辞典(第2層)は変わらない知識、scene-library(第3層)は作品ごとに増える資産、CLAUDE.md(第1層)は両者への交通整理。
- **演出は番号で会話する。** 「transitions #101」のように辞典の番号で指示すると、意図が正確に伝わる。
- **サビは差分、色は物語、余韻は署名。** 各スキルの冒頭に置かれた原則が、パターンの取捨選択を導く。

## 収録規模(v1.0)

カメラワーク50 / MV演出100 / 歌詞アニメ80 / サビ演出50 / トランジション120 = **計400パターン** + 理論4編(色彩・撮影・照明・心理学) + 実装テンプレート + シードコンポーネント10点。
