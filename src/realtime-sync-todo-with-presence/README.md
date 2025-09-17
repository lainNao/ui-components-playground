# Realtime Sync Todo with Presence

- realtime-sync-todo の拡張版で、プレゼンス機能（ユーザーの現在の状態がわかる機能）を追加
  - 要するに`presence/${userId}/{状態}`を置いてそれも購読させ、状態として管理すればいいだけ
  - setTimeout などで一定期間その userId の状態が更新されなければ、表示を消せばいい
  - （上記の原理が分かったので vibe coding で対応）
