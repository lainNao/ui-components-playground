# virtual-scroll-vertical-horizontal-with-sticky-headers

- 一筋縄では行かなかった。`https://github.com/sojinantony01/react-spread-sheet` を参考にした
- **使用技術**
  - sticky:
    - CSS の `position: sticky`
  - 仮想スクロール:
    - 表示範囲だけ描画（ヘッダー、データ共に）
    - 表示範囲外は、でかい空のスペーサーを表示
    - スクロールに合わせて、表示範囲を動的に更新
      - rAF で描画範囲の更新をスロットリング

## 実現しているライブラリ例

- <https://github.com/handsontable/handsontable>
- <https://github.com/walkframe/gridsheet>
- <https://github.com/sojinantony01/react-spread-sheet>
