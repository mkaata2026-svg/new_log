# Scene Library Registry

全資産のカタログ。**昇格時に必ず1行追加すること**(T9テンプレート参照)。
`使用MV` 列は使うたびに追記する(カンマ区切り)。使用実績が資産の信頼度である。

| 名前 | 分類 | 使用MV | 説明 |
|---|---|---|---|
| knj-theme (lib) | util | (seed) | パレット・spring・フォント定数。全MVの色とモーションの正 |
| timing (lib) | util | (seed) | BPM→フレーム変換(beat/bar/beatPhase)。音同期の土台 |
| KnjCameraRig | camera | (seed) | 2.5Dカメラ土台+呼吸ノイズ内蔵。camera-work全パターンの実行基盤 |
| KnjGrade | texture | (seed) | グレイン+ビネット+フィルタの最終グレーディング層 |
| KnjLyricLine | lyric | (seed) | 文字stagger歌詞表示。mode: fade/rise/blur/pop/karaoke |
| KnjNeonText | light | (seed) | ネオン管テキスト。点灯シーケンス・故障明滅・ブルーム内蔵 |
| KnjParticleField | particle | (seed) | 決定論的パーティクル(雨/雪/塵/上昇光)。mode切替 |
| KnjGradientBackdrop | background | (seed) | 夜明け型カラーアーク対応の背景グラデ。紫経由ルール実装済み |
| KnjChorusBurst | chorus | (seed) | サビ点火(白フラッシュ+シェイク+RGBずれ)を1コンポーネントで |
| KnjTransitionWipe | transition | (seed) | ソフトエッジワイプ(transitions #28)。方向・帯幅可変 |

<!-- 昇格テンプレート(コピーして使う):
| Knj〇〇 | 分類 | slug | 一言説明 |
-->
