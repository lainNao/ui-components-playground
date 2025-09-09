# ui-components-playground

- UI コンポーネントの少し面倒な要件の試し実装などを行うリポジトリ
- <https://lainnao.github.io/ui-components-playground/> にアクセスするか、または`npm run storybook` を実行していただくかのいずれかで Storybook が立ち上がります

## 一覧

### Sticky ヘッダー

- [sticky-left-top](https://github.com/lainNao/ui-components-playground/tree/main/src/sticky-left-top) : 上と左が固定された表
- [sticky-left-top-right](https://github.com/lainNao/ui-components-playground/tree/main/src/sticky-left-top-right) : 上と左と右が固定された表
- [sticky-left-top-right-bottom](https://github.com/lainNao/ui-components-playground/tree/main/src/sticky-left-top-right-bottom) : 上と左と右と下が固定された表

### 仮想スクロール

- [virtual-scroll-vertical](https://github.com/lainNao/ui-components-playground/tree/main/src/virtual-scroll-vertical) : 縦方向の仮想スクロール
- [virtual-scroll-random-item-height](https://github.com/lainNao/ui-components-playground/tree/main/src/virtual-scroll-vertical-random-item-height) : 行の高さが不定な縦方向の仮想スクロール
- [virtual-scroll-vertical-horizontal](https://github.com/lainNao/ui-components-playground/tree/main/src/virtual-scroll-vertical-horizontal) : 縦横両方向の仮想スクロール

### スクロールアニメーション

- [animation-scroll-jack](https://github.com/lainNao/ui-components-playground/tree/main/src/animation-scroll-jack) : 縦スクロールしてる途中で突然スクロールジャックされ、縦以外のスクロールやアニメーションが始まるやつ

### ノード接続線

- [connecting-line-svg](https://github.com/lainNao/ui-components-playground/tree/main/src/connecting-line-svg) : SVG で要素同士を線で結ぶ

### TODO

- **primitive : プリミティブ**
  - virtual-scroll-vertical-horizontal : 縦横両方向の仮想スクロール
  - parallax-scroll : パララックススクロール
  - dnd-list-reorder : ドラッグアンドドロップでリストの並び替え
  - animation-page-transition : ページ遷移時にモーフィングする
  - animation-chart-div : div でアニメーションするチャート
  - animation-chart-canvas : canvas でアニメーションするチャート
  - animation-svg-smil : SVG の SMIL でアニメーション
  - web-components : Web Components
  - editor-rich-text : リッチテキストエディター
  - calendar : カレンダー
  - date-time-picker : 日付時刻ピッカー
  - viewer-pdf : PDF ビューワー
  - viewer-image : 画像ビューワー
  - viewer-markdown : Markdown ビューワー
  - viewer-office : Office ファイル（Word、Excel、PowerPoint）ビューワー
  - viewer-3d : 3D モデルビューワー
  - viewer-video : 動画ビューワー
  - viewer-audio : 音声ビューワー
  - viewer-midi : MIDI ビューワー
  - viewer-epub : EPUB ビューワー
  - panel-resizable : リサイズ可能なパネル
  - panel-movable : VSCode のように移動可能なパネル
- **combination : 組み合わせ**
  - editor-video : 動画エディター
  - editor-audio : 音声エディター
  - editor-midi : MIDI エディター
  - editor-image : 画像エディター
  - editor-pdf : PDF エディター
  - spreadsheet : スプレッドシート（canvas 版、div 版）
  - map-google: 地図（Google Map の超簡易版）
  - map-mind : マインドマップ
  - combined-virtual-scroll-and-sticky : 仮想スクロール（縦横すべて）と sticky ヘッダー（左、上）の組み合わせ
