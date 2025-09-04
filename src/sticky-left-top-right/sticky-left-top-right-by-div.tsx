import React from "react";

const rows = Array.from({ length: 30 }, (_, i) => `タスク${i + 1}`);
const columns = Array.from({ length: 30 }, (_, i) => `列${i + 1}`);

export function StickyLeftTopRightByDiv() {
  return (
    <div
      style={{
        width: "80vw",
        height: "80vh",
        overflow: "auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `120px repeat(${columns.length + 1}, 100px)`,
          minWidth: `${120 + (columns.length + 1) * 100}px`,
        }}
      >
        {/* 左上のコーナーセル */}
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 3,
            backgroundColor: "#333",
            color: "white",
            height: "50px",
            border: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          項目
        </div>

        {/* 上部ヘッダーセル */}
        {columns.map((col) => (
          <div
            key={col}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#666",
              color: "white",
              height: "50px",
              border: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {col}
          </div>
        ))}

        {/* 右上のコーナーセル */}
        <div
          style={{
            position: "sticky",
            top: 0,
            right: 0,
            zIndex: 3,
            backgroundColor: "#333",
            color: "white",
            height: "50px",
            border: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          項目 (右)
        </div>

        {/* データ行 */}
        {rows.map((row, rowIndex) => (
          <React.Fragment key={row}>
            {/* 左側ヘッダーセル */}
            <div
              style={{
                position: "sticky",
                left: 0,
                zIndex: 1,
                backgroundColor: "#999",
                color: "white",
                height: "60px",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {row}
            </div>

            {/* データセル */}
            {columns.map((column, colIndex) => (
              <div
                key={column}
                style={{
                  backgroundColor: "white",
                  height: "60px",
                  border: "1px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {rowIndex}-{colIndex}
              </div>
            ))}

            {/* 右側ヘッダーセル */}
            <div
              style={{
                position: "sticky",
                right: 0,
                backgroundColor: "#999",
                color: "white",
                height: "60px",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              合計
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
