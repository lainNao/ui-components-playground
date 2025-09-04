const rows = Array.from({ length: 30 }, (_, i) => `タスク${i + 1}`);
const columns = Array.from({ length: 30 }, (_, i) => `列${i + 1}`);

export function StickyLeftTopByTable() {
  return (
    <div
      style={{
        width: "80vw",
        height: "80vh",
        overflow: "auto",
        backgroundColor: "blue",
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          minWidth: "800px",
        }}
      >
        {/* 上部ヘッダー行 */}
        <thead>
          <tr>
            {/* 左上のコーナーセル */}
            <th
              style={{
                position: "sticky",
                top: 0,
                left: 0,
                zIndex: 3,
                backgroundColor: "#333",
                color: "white",
                width: "120px",
                height: "50px",
                border: "1px solid #ccc",
              }}
            >
              項目
            </th>
            {/* 上部ヘッダーセル */}
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: "#666",
                  color: "white",
                  width: "100px",
                  height: "50px",
                  border: "1px solid #ccc",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row}>
              {/* 左側ヘッダーセル */}
              <td
                style={{
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  backgroundColor: "#999",
                  color: "white",
                  width: "120px",
                  height: "60px",
                  border: "1px solid #ccc",
                  textAlign: "center",
                }}
              >
                {row}
              </td>
              {/* データセル */}
              {columns.map((col, colIndex) => (
                <td
                  key={col}
                  style={{
                    backgroundColor: "white",
                    width: "100px",
                    height: "60px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                >
                  {rowIndex}-{colIndex}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
