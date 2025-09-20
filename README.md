# ui-components-playground

- Web フロントエンドの実装で少し面倒なやつをミニマムに実装するリポジトリです。腕試しや学習のため、あえてライブラリ使わない実装が多いです
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
- [virtual-scroll-vertical-horizontal-with-sticky-headers](https://github.com/lainNao/ui-components-playground/tree/main/src/virtual-scroll-vertical-horizontal-with-sticky-headers) : 上と左に Sticky ヘッダーがある、縦横の仮想スクロールをした表

> [!NOTE]
>
> - 全部レンダリングしないので、cmd(ctrl) + f の検索機能に弱い。
>   - そのため、もし全文検索をしたい場合、別途検索窓を用意することになる
> - 全部レンダリングしないので、大量行選択からの cmd(ctrl) + c のコピーをしてもレンダリングしている範囲しかコピーしてくれない。
>   - そのため、もし同じ UX でコピーを成功させたい場合、コピー開始位置を状態管理することになりそう
> - パフォーマンス問題への対応の場合は、代替としてページネーションを使う方法もある

### ノード接続線

- [connecting-line-svg](https://github.com/lainNao/ui-components-playground/tree/main/src/connecting-line-svg) : SVG で要素同士を線で結ぶ

### スクロールアニメーション

- [animation-scroll-jack](https://github.com/lainNao/ui-components-playground/tree/main/src/animation-scroll-jack) : 縦スクロールしてる途中で突然スクロールジャックされ、縦以外のスクロールやアニメーションが始まるやつ

### SVG アニメーション

- [animation-svg](https://github.com/lainNao/ui-components-playground/tree/main/src/animation-svg) : SVG アニメーション

### 複数人による同時編集

- [realtime-sync-todo](https://github.com/lainNao/ui-components-playground/tree/main/src/realtime-sync-todo) : 複数人による同時編集機能ありの TODO リスト
- [realtime-sync-todo-with-presence](https://github.com/lainNao/ui-components-playground/tree/main/src/realtime-sync-todo-with-presence) : プレゼンス機能付き、複数人による同時編集機能ありの TODO リスト

### 音楽

- [piano-roll](https://github.com/lainNao/ui-components-playground/tree/main/src/piano-roll) : マウスや MIDI デバイスで音を鳴らせるピアノロール

## TODO

- **primitive : プリミティブ**
  - carousel : カルーセル
  - parallax-scroll : パララックススクロール
  - dnd-list-reorder : ドラッグアンドドロップでリストの並び替え
  - animation-page-transition : ページ遷移時にモーフィングする
  - animation-chart-div : div でアニメーションするチャート
  - animation-chart-canvas : canvas でアニメーションするチャート
  - animation-chart-svg : SVG でアニメーションするチャート
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
  - realtime-sync-gantt : 複数人でリアルタイム同時編集できるガントチャート
