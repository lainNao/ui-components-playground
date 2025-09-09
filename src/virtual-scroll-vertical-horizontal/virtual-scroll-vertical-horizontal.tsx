import { useState } from "react";

const fixedSizeCells = Array.from({ length: 1000 }, (_, i) =>
  Array.from({ length: 1000 }, (_, j) => `${i + 1}-${j + 1}`)
);
function getDisplayedItems({
  cells,
  topIndex,
  leftIndex,
  containerHeight,
  rowHeight,
  containerWidth,
  columnWidth,
}: {
  cells: string[][];
  topIndex: number;
  leftIndex: number;
  containerHeight: number;
  rowHeight: number;
  containerWidth: number;
  columnWidth: number;
}): string[][] {
  const itemsPerPageVertical = Math.ceil(containerHeight / rowHeight);
  const itemsPerPageHorizontal = Math.ceil(containerWidth / columnWidth);
  return cells
    .slice(topIndex, topIndex + itemsPerPageVertical + 1)
    .map((row) => row.slice(leftIndex, leftIndex + itemsPerPageHorizontal + 1));
}

export function VirtualScrollVerticalHorizontal() {
  const [displayItemTopLeftIndex, setDisplayItemTopLeftIndex] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const containerHeight = 400;
  const rowHeight = 30;
  const containerWidth = 800;
  const columnWidth = 100;

  const rows = getDisplayedItems({
    cells: fixedSizeCells,
    topIndex: displayItemTopLeftIndex.top,
    leftIndex: displayItemTopLeftIndex.left,
    containerHeight,
    rowHeight,
    containerWidth,
    columnWidth,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newTopIndex = Math.floor(e.currentTarget.scrollTop / rowHeight);
    const newLeftIndex = Math.floor(e.currentTarget.scrollLeft / columnWidth);
    if (
      newTopIndex === displayItemTopLeftIndex.top &&
      newLeftIndex === displayItemTopLeftIndex.left
    ) {
      return;
    }
    setDisplayItemTopLeftIndex({ top: newTopIndex, left: newLeftIndex });
  };

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth,
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid #ccc",
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          position: "relative",
          // 全行の高さ
          height: fixedSizeCells.length * rowHeight,
          // 全列の幅
          width: fixedSizeCells[0].length * columnWidth,
        }}
      >
        <div
          style={{
            position: "absolute",
            // 表示されている行群の位置を調整
            top: displayItemTopLeftIndex.top * rowHeight,
            left: displayItemTopLeftIndex.left * columnWidth,
          }}
        >
          {rows.map((row) => (
            <div style={{ display: "flex" }} key={row[0]}>
              {row.map((cell) => (
                <div
                  key={cell}
                  style={{
                    width: columnWidth,
                    height: rowHeight,
                    boxSizing: "border-box",
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
