import { useState } from "react";

const rows = Array.from({ length: 10000 }, (_, i) => ({
  height: 20 + (i % 10) * 10,
  content: `タスク${i + 1}`,
}));

const containerHeight = 400;

function getDisplayedRowsIndexes({
  rowHeightList,
  currentTopRowIndex,
  containerHeight,
}: {
  rowHeightList: number[];
  currentTopRowIndex: number;
  containerHeight: number;
}): number[] {
  const displayedRowsIndexes = [];
  let accumulatedHeight = 0;

  // 前後1個ずつ追加レンダリングするため、開始インデックスを調整
  const startIndex = Math.max(0, currentTopRowIndex - 1);

  for (let i = startIndex; i < rowHeightList.length; i++) {
    // コンテナ高さを超えても追加で1個レンダリング
    if (
      accumulatedHeight >= containerHeight &&
      displayedRowsIndexes.length > 0
    ) {
      // 最後に1個追加
      displayedRowsIndexes.push(i);
      break;
    }
    displayedRowsIndexes.push(i);
    accumulatedHeight += rowHeightList[i];
  }
  return displayedRowsIndexes;
}

export function VirtualScrollVerticalRandomItemHeight() {
  const [displayItemTopIndex, setDisplayItemTopIndex] = useState(0);

  const displayedRowIndexes = getDisplayedRowsIndexes({
    rowHeightList: rows.map((r) => r.height),
    currentTopRowIndex: displayItemTopIndex,
    containerHeight,
  });

  const displayedRows = displayedRowIndexes.map((i) => rows[i]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newTopIndex = rows.findIndex((_, i) => {
      const accumulatedHeight = rows
        .slice(0, i)
        .reduce((sum, r) => sum + r.height, 0);
      return accumulatedHeight > scrollTop;
    });
    if (newTopIndex === displayItemTopIndex) {
      return;
    }
    setDisplayItemTopIndex(newTopIndex);
  };

  return (
    <div
      style={{
        height: containerHeight,
        overflowY: "auto",
        border: "1px solid #ccc",
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          // 全行の高さ
          height: rows.reduce((sum, r) => sum + r.height, 0),
        }}
      >
        <div
          style={{
            position: "relative",
            // 表示されている行群の位置を調整（前1個追加分を考慮）
            top: rows
              .slice(0, Math.max(0, displayItemTopIndex - 1))
              .reduce((sum, r) => sum + r.height, 0),
          }}
        >
          {displayedRows.map((row) => (
            <div
              key={row.content}
              style={{ height: row.height, borderBottom: "1px solid #eee" }}
            >
              {row.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
