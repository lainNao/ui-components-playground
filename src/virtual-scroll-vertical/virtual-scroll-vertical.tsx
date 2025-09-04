import { useState } from "react";

const rows = Array.from({ length: 10000 }, (_, i) => `タスク${i + 1}`);
const containerHeight = 400;
const itemHeight = 30;

function getDisplayedItems({
  rows,
  topIndex,
  containerHeight,
  itemHeight,
}: {
  rows: string[];
  topIndex: number;
  containerHeight: number;
  itemHeight: number;
}) {
  const itemsPerPage = Math.ceil(containerHeight / itemHeight);
  return rows.slice(topIndex, topIndex + itemsPerPage);
}

export function VirtualScrollVertical() {
  const [displayItemTopIndex, setDisplayItemTopIndex] = useState(0);

  const displayedItems = getDisplayedItems({
    rows,
    topIndex: displayItemTopIndex,
    containerHeight,
    itemHeight,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newTopIndex = Math.floor(scrollTop / itemHeight);
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
      <div style={{ height: rows.length * itemHeight }}>
        <div
          style={{
            position: "relative",
            top: displayItemTopIndex * itemHeight,
          }}
        >
          {displayedItems.map((row) => (
            <div
              key={row}
              style={{ height: itemHeight, borderBottom: "1px solid #eee" }}
            >
              {row}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
