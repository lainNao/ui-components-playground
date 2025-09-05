# animation-scroll-jack

- 仕組み的には
  - 横長の要素を作る
  - その祖先に、その横長分の高さを持つ要素を作る
  - その祖先を position: sticky; top: 0; にする
  - onScroll を監視して、sticky の範囲内に入っている時に横長要素を translate で動かす
- で実現できる
