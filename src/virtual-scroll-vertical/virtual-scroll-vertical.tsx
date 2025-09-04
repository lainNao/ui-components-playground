import { useState } from "react";

const rows = Array.from({ length: 10000 }, (_, i) => `タスク${i + 1}`);
const containerHeight = 400;
const rowHeight = 30;

function getDisplayedItems({
  rows,
  topIndex,
  containerHeight,
  rowHeight,
}: {
  rows: string[];
  topIndex: number;
  containerHeight: number;
  rowHeight: number;
}) {
  const itemsPerPage = Math.ceil(containerHeight / rowHeight);
  return rows.slice(topIndex, topIndex + itemsPerPage);
}

export function VirtualScrollVertical() {
  const [displayItemTopIndex, setDisplayItemTopIndex] = useState(0);

  const displayedItems = getDisplayedItems({
    rows,
    topIndex: displayItemTopIndex,
    containerHeight,
    rowHeight,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newTopIndex = Math.floor(scrollTop / rowHeight);
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
      <div style={{ height: rows.length * rowHeight }}>
        <div
          style={{
            position: "relative",
            top: displayItemTopIndex * rowHeight,
          }}
        >
          {displayedItems.map((row) => (
            <div
              key={row}
              style={{ height: rowHeight, borderBottom: "1px solid #eee" }}
            >
              {row}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
