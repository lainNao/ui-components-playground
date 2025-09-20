# animation-svg

- 単に css で svg のスタイルをアニメーションさせてるだけ
- svg は以下が表現力あった
  - marker
  - stroke-dasharray
  - stroke-dashoffset

## favorite-particle

- 案外シンプルにできている
  - 1 つの丸をアニメーションで動かしてから消している。これがまず基本
  - あとは、それをある程度ランダマイズさせて大量に map で配置しているだけ
  - 一応 on の時だけその要素を rendering し、一定時間後に rendering をやめる
- (vibe coding させてから理解する流れで実装)
