# Scene Library — KNJYKKI 演出資産ライブラリ

MVを作るたびに「KNJYKKIらしい映像言語」をここへ蓄積する。
**このディレクトリの成長こそが、このリポジトリの本体である。**

## 構成

```
scene-library/
  lib/        テーマ定数・タイミング計算などの純ロジック
  hooks/      共有hooks
  components/ 再利用可能な演出コンポーネント(Knjプレフィックス)
  registry.md 全資産のカタログ(1資産=1行)
```

## 使い方

MVのコードから相対importで使う:

```tsx
import {palette, springs} from '../../../scene-library/lib/knj-theme';
import {KnjCameraRig} from '../../../scene-library/components/KnjCameraRig';
```

## 昇格手順(MV固有コード → ライブラリ)

1. **2本以上のMVで使える見込み**があるか自問する。1本限りの演出は昇格しない。
2. MV固有の値(色・尺・テキスト)をすべてpropsに追い出す。色のデフォルトは `knj-theme.ts` から。
3. `components/Knj<名前>.tsx` として移動し、ファイル冒頭に用途コメント(1〜2行)を書く。
4. `registry.md` に1行追加(名前 / 分類 / 初出MV / 説明)。
5. 元のMVコードをライブラリ参照に書き換え、見た目が変わっていないことを確認。

## 変更のルール(後方互換)

- 既存propsの意味を変えない(過去MVが再レンダできなくなる)。挙動を変えたい時はprops追加 or 新コンポーネント。
- 破壊的変更がどうしても必要な場合は、旧版を `Knj<名前>Legacy.tsx` として残す。
- 削除は禁止。使われなくなっても registry に「retired」と記して残す。

## 命名・分類

分類は registry の `分類` 列に使う固定語彙:
`camera / lyric / transition / light / texture / background / particle / chorus / util`

## シード資産について

v1.0 時点の資産は Master Guide と同時に作られたシード(初期セット)。
実MVでの使用実績がついたら registry の「使用MV」列を更新していくこと。
