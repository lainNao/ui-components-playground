import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  generateSampleCellValues_forCanvas,
  getExcelLikeColumnName,
} from "./util";

// --- 定数 ---
const ROW_HEIGHT = 32;
const COLUMN_WIDTH = 100;
const ROW_HEADER_WIDTH = 60;
const COLUMN_HEADER_HEIGHT = 32;

const TOTAL_ROWS = 10000;
const TOTAL_COLS = 1000;

// 描画バッファー（画面外も描画して滑らかなスクロールを実現）
const RENDER_BUFFER_ROWS = 3;
const RENDER_BUFFER_COLS = 2;

const sampleCellValues = generateSampleCellValues_forCanvas(
  TOTAL_ROWS,
  TOTAL_COLS
);

export function VirtualScrollVerticalHorizontalWithStickyHeadersCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // viewport サイズ
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // スクロール位置
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const rafIdRef = useRef<number | null>(null);

  // 選択されたセル
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
    value: string;
  } | null>(null);

  // 入力フィールド
  const inputRef = useRef<HTMLInputElement>(null);

  // 行の可視範囲（描画用）
  const { startRow, endRow } = useMemo(() => {
    const viewStartRow = Math.max(
      0,
      Math.floor(scrollPosition.top / ROW_HEIGHT)
    );
    const viewEndRow = Math.min(
      TOTAL_ROWS - 1,
      Math.floor((scrollPosition.top + viewport.height) / ROW_HEIGHT)
    );

    return {
      startRow: Math.max(0, viewStartRow - RENDER_BUFFER_ROWS),
      endRow: Math.min(TOTAL_ROWS - 1, viewEndRow + RENDER_BUFFER_ROWS),
    };
  }, [scrollPosition.top, viewport.height]);

  // 列の可視範囲（描画用）
  const { startCol, endCol } = useMemo(() => {
    const viewStartCol = Math.max(
      0,
      Math.floor(scrollPosition.left / COLUMN_WIDTH)
    );
    const viewEndCol = Math.min(
      TOTAL_COLS - 1,
      Math.floor((scrollPosition.left + viewport.width) / COLUMN_WIDTH)
    );

    return {
      startCol: Math.max(0, viewStartCol - RENDER_BUFFER_COLS),
      endCol: Math.min(TOTAL_COLS - 1, viewEndCol + RENDER_BUFFER_COLS),
    };
  }, [scrollPosition.left, viewport.width]);

  // データ領域の描画（グリッド線、ハイライト、テキスト）
  const drawDataArea = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // データ領域のクリッピングを設定（ヘッダーを除く）
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        ROW_HEADER_WIDTH,
        COLUMN_HEADER_HEIGHT,
        viewport.width - ROW_HEADER_WIDTH,
        viewport.height - COLUMN_HEADER_HEIGHT
      );
      ctx.clip();

      // グリッド線の色設定（データ領域）
      ctx.strokeStyle = "#e1e4e8";
      ctx.lineWidth = 1;

      // データ領域の垂直線を描画（列の境界）
      ctx.beginPath();
      for (let col = startCol; col <= endCol + 1; col++) {
        const x = ROW_HEADER_WIDTH + col * COLUMN_WIDTH - scrollPosition.left;
        if (
          x >= ROW_HEADER_WIDTH - COLUMN_WIDTH &&
          x <= viewport.width + COLUMN_WIDTH
        ) {
          ctx.moveTo(x, COLUMN_HEADER_HEIGHT);
          ctx.lineTo(x, viewport.height);
        }
      }
      ctx.stroke();

      // データ領域の水平線を描画（行の境界）
      ctx.beginPath();
      for (let row = startRow; row <= endRow + 1; row++) {
        const y = COLUMN_HEADER_HEIGHT + row * ROW_HEIGHT - scrollPosition.top;
        if (
          y >= COLUMN_HEADER_HEIGHT - ROW_HEIGHT &&
          y <= viewport.height + ROW_HEIGHT
        ) {
          ctx.moveTo(ROW_HEADER_WIDTH, y);
          ctx.lineTo(viewport.width, y);
        }
      }
      ctx.stroke();

      // 選択されたセルをハイライト（データ領域のみ）
      if (selectedCell) {
        const cellX =
          ROW_HEADER_WIDTH +
          selectedCell.col * COLUMN_WIDTH -
          scrollPosition.left;
        const cellY =
          COLUMN_HEADER_HEIGHT +
          selectedCell.row * ROW_HEIGHT -
          scrollPosition.top;

        if (
          cellX + COLUMN_WIDTH > ROW_HEADER_WIDTH &&
          cellX < viewport.width &&
          cellY + ROW_HEIGHT > COLUMN_HEADER_HEIGHT &&
          cellY < viewport.height
        ) {
          const drawX = Math.max(ROW_HEADER_WIDTH, cellX);
          const drawY = Math.max(COLUMN_HEADER_HEIGHT, cellY);
          const drawWidth = Math.min(
            COLUMN_WIDTH - Math.max(0, ROW_HEADER_WIDTH - cellX),
            viewport.width - drawX
          );
          const drawHeight = Math.min(
            ROW_HEIGHT - Math.max(0, COLUMN_HEADER_HEIGHT - cellY),
            viewport.height - drawY
          );

          if (drawWidth > 0 && drawHeight > 0) {
            ctx.fillStyle = "rgba(0, 123, 255, 0.1)";
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);

            // 選択枠
            ctx.strokeStyle = "#007bff";
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
          }
        }
      }

      // データセルのテキストを描画（データ領域のみ）
      ctx.fillStyle = "#24292e";
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const x =
            ROW_HEADER_WIDTH +
            col * COLUMN_WIDTH +
            COLUMN_WIDTH / 2 -
            scrollPosition.left;
          const y =
            COLUMN_HEADER_HEIGHT +
            row * ROW_HEIGHT +
            ROW_HEIGHT / 2 -
            scrollPosition.top;

          // 画面内またはバッファー領域内の場合に描画
          if (
            x >= ROW_HEADER_WIDTH - COLUMN_WIDTH &&
            x <= viewport.width + COLUMN_WIDTH &&
            y >= COLUMN_HEADER_HEIGHT - ROW_HEIGHT &&
            y <= viewport.height + ROW_HEIGHT
          ) {
            // 編集中のセルは描画しない
            if (
              editingCell &&
              editingCell.row === row &&
              editingCell.col === col
            ) {
              continue;
            }

            const cellValue = sampleCellValues[row]?.[col] || "";

            // セル範囲でクリッピングして長いテキストがはみ出ないようにする
            ctx.save();
            const cellLeft =
              ROW_HEADER_WIDTH + col * COLUMN_WIDTH - scrollPosition.left;
            const cellTop =
              COLUMN_HEADER_HEIGHT + row * ROW_HEIGHT - scrollPosition.top;
            ctx.beginPath();
            ctx.rect(
              Math.max(ROW_HEADER_WIDTH, cellLeft),
              Math.max(COLUMN_HEADER_HEIGHT, cellTop),
              Math.min(
                COLUMN_WIDTH,
                viewport.width - Math.max(ROW_HEADER_WIDTH, cellLeft)
              ),
              Math.min(
                ROW_HEIGHT,
                viewport.height - Math.max(COLUMN_HEADER_HEIGHT, cellTop)
              )
            );
            ctx.clip();

            ctx.fillText(cellValue, x, y);
            ctx.restore();
          }
        }
      }

      // データ領域のクリッピングを解除
      ctx.restore();
    },
    [
      viewport,
      scrollPosition,
      startRow,
      endRow,
      startCol,
      endCol,
      selectedCell,
      editingCell,
    ]
  );

  // 行ヘッダーの描画
  const drawRowHeaders = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // 行ヘッダー領域のクリッピングを設定
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        0,
        COLUMN_HEADER_HEIGHT,
        ROW_HEADER_WIDTH,
        viewport.height - COLUMN_HEADER_HEIGHT
      );
      ctx.clip();

      // 行ヘッダー背景
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(
        0,
        COLUMN_HEADER_HEIGHT,
        ROW_HEADER_WIDTH,
        viewport.height - COLUMN_HEADER_HEIGHT
      );

      // 行ヘッダーのテキストを描画（行ヘッダー領域のみ）
      ctx.fillStyle = "#24292e";
      for (let row = startRow; row <= endRow; row++) {
        const x = ROW_HEADER_WIDTH / 2;
        const y =
          COLUMN_HEADER_HEIGHT +
          row * ROW_HEIGHT +
          ROW_HEIGHT / 2 -
          scrollPosition.top;

        if (
          y >= COLUMN_HEADER_HEIGHT - ROW_HEIGHT &&
          y <= viewport.height + ROW_HEIGHT
        ) {
          ctx.fillText(String(row + 1), x, y);
        }
      }

      // 行ヘッダー領域のクリッピングを解除
      ctx.restore();
    },
    [viewport, scrollPosition, startRow, endRow]
  );

  // 列ヘッダーの描画
  const drawColumnHeaders = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // 列ヘッダー領域のクリッピングを設定
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        ROW_HEADER_WIDTH,
        0,
        viewport.width - ROW_HEADER_WIDTH,
        COLUMN_HEADER_HEIGHT
      );
      ctx.clip();

      // 列ヘッダー背景
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(
        ROW_HEADER_WIDTH,
        0,
        viewport.width - ROW_HEADER_WIDTH,
        COLUMN_HEADER_HEIGHT
      );

      // 列ヘッダーのテキストを描画（列ヘッダー領域のみ）
      ctx.fillStyle = "#24292e";
      for (let col = startCol; col <= endCol; col++) {
        const x =
          ROW_HEADER_WIDTH +
          col * COLUMN_WIDTH +
          COLUMN_WIDTH / 2 -
          scrollPosition.left;
        const y = COLUMN_HEADER_HEIGHT / 2;

        if (
          x >= ROW_HEADER_WIDTH - COLUMN_WIDTH &&
          x <= viewport.width + COLUMN_WIDTH
        ) {
          ctx.fillText(getExcelLikeColumnName(col), x, y);
        }
      }

      // 列ヘッダー領域のクリッピングを解除
      ctx.restore();
    },
    [viewport, scrollPosition, startCol, endCol]
  );

  // ヘッダー境界線の描画
  const drawHeaderBorders = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // 左上角のヘッダー背景（最前面）
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, ROW_HEADER_WIDTH, COLUMN_HEADER_HEIGHT);

      // ヘッダー境界線
      ctx.strokeStyle = "#e1e4e8";
      ctx.lineWidth = 1;

      // ヘッダー領域の垂直線
      ctx.beginPath();
      ctx.moveTo(ROW_HEADER_WIDTH, 0);
      ctx.lineTo(ROW_HEADER_WIDTH, viewport.height);
      ctx.stroke();

      // ヘッダー領域の水平線
      ctx.beginPath();
      ctx.moveTo(0, COLUMN_HEADER_HEIGHT);
      ctx.lineTo(viewport.width, COLUMN_HEADER_HEIGHT);
      ctx.stroke();

      // ヘッダー境界線を強調
      ctx.strokeStyle = "#d1d5da";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ROW_HEADER_WIDTH, 0);
      ctx.lineTo(ROW_HEADER_WIDTH, viewport.height);
      ctx.moveTo(0, COLUMN_HEADER_HEIGHT);
      ctx.lineTo(viewport.width, COLUMN_HEADER_HEIGHT);
      ctx.stroke();
    },
    [viewport]
  );

  // Canvas描画関数
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    // 背景をクリア
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // フォント設定
    ctx.font = "14px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 背景色
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    // 各領域を描画
    drawDataArea(ctx);
    drawRowHeaders(ctx);
    drawColumnHeaders(ctx);
    drawHeaderBorders(ctx);
  }, [
    viewport,
    drawDataArea,
    drawRowHeaders,
    drawColumnHeaders,
    drawHeaderBorders,
  ]);

  // スクロールハンドラー
  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setScrollPosition({
        top: container.scrollTop,
        left: container.scrollLeft,
      });
      rafIdRef.current = null;
    });
  }, []);

  // マウスイベントからセル位置を取得する共通処理
  const getCellPosition = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // ヘッダー領域の場合は null を返す
      if (x < ROW_HEADER_WIDTH || y < COLUMN_HEADER_HEIGHT) {
        return null;
      }

      // セル位置を計算
      const col = Math.floor(
        (x - ROW_HEADER_WIDTH + scrollPosition.left) / COLUMN_WIDTH
      );
      const row = Math.floor(
        (y - COLUMN_HEADER_HEIGHT + scrollPosition.top) / ROW_HEIGHT
      );

      // 有効範囲内のセルのみ返す
      if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < TOTAL_COLS) {
        return { row, col };
      }

      return null;
    },
    [scrollPosition]
  );

  // クリックハンドラー
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const cellPosition = getCellPosition(event);

      if (cellPosition) {
        setSelectedCell(cellPosition);
        setEditingCell(null);
      } else {
        setSelectedCell(null);
        setEditingCell(null);
      }
    },
    [getCellPosition]
  );

  // ダブルクリックで編集モードに入る
  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const cellPosition = getCellPosition(event);

      // ヘッダー領域のダブルクリックまたは選択されたセルがない場合は無視
      if (!cellPosition || !selectedCell) return;

      const cellValue =
        sampleCellValues[selectedCell.row]?.[selectedCell.col] || "";
      setEditingCell({
        row: selectedCell.row,
        col: selectedCell.col,
        value: cellValue,
      });

      // フォーカスを入力フィールドに移す
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    },
    [getCellPosition, selectedCell]
  );

  // 指定したセルが見える範囲にスクロールする処理
  const scrollToCell = useCallback((row: number, col: number) => {
    const container = containerRef.current;
    if (!container) return;

    const cellLeft = col * COLUMN_WIDTH;
    const cellTop = row * ROW_HEIGHT;
    const cellRight = cellLeft + COLUMN_WIDTH;
    const cellBottom = cellTop + ROW_HEIGHT;

    const viewLeft = container.scrollLeft;
    const viewTop = container.scrollTop;
    const viewRight = viewLeft + container.clientWidth - ROW_HEADER_WIDTH;
    const viewBottom = viewTop + container.clientHeight - COLUMN_HEADER_HEIGHT;

    let newScrollLeft = viewLeft;
    let newScrollTop = viewTop;

    if (cellLeft < viewLeft) {
      newScrollLeft = cellLeft;
    } else if (cellRight > viewRight) {
      newScrollLeft = cellRight - (container.clientWidth - ROW_HEADER_WIDTH);
    }

    if (cellTop < viewTop) {
      newScrollTop = cellTop;
    } else if (cellBottom > viewBottom) {
      newScrollTop =
        cellBottom - (container.clientHeight - COLUMN_HEADER_HEIGHT);
    }

    if (newScrollLeft !== viewLeft || newScrollTop !== viewTop) {
      container.scrollTo(newScrollLeft, newScrollTop);
    }
  }, []);

  // キーボードハンドラー
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (editingCell) return; // 編集中はキーボードナビゲーションを無効化

      if (!selectedCell) return;

      let newRow = selectedCell.row;
      let newCol = selectedCell.col;

      event.preventDefault();
      switch (event.key) {
        case "ArrowUp":
          newRow = Math.max(0, selectedCell.row - 1);
          break;
        case "ArrowDown":
          newRow = Math.min(TOTAL_ROWS - 1, selectedCell.row + 1);
          break;
        case "ArrowLeft":
          newCol = Math.max(0, selectedCell.col - 1);
          break;
        case "ArrowRight":
          newCol = Math.min(TOTAL_COLS - 1, selectedCell.col + 1);
          break;
        case "Enter": {
          const cellValue =
            sampleCellValues[selectedCell.row]?.[selectedCell.col] || "";
          setEditingCell({
            row: selectedCell.row,
            col: selectedCell.col,
            value: cellValue,
          });
          setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
          }, 0);
          break;
        }
        case "Escape":
          setSelectedCell(null);
          break;
      }

      if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
        setSelectedCell({ row: newRow, col: newCol });
        // 選択したセルが見える範囲にスクロール
        scrollToCell(newRow, newCol);
      }
    },
    [selectedCell, editingCell, scrollToCell]
  );

  // 編集完了ハンドラー
  const handleEditComplete = useCallback(() => {
    if (editingCell) {
      // 実際のデータ更新
      sampleCellValues[editingCell.row][editingCell.col] = editingCell.value;
      setEditingCell(null);
    }
  }, [editingCell]);

  // 編集キャンセルハンドラー
  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  // 初期化とリサイズ監視
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 初期値
    setScrollPosition({ top: container.scrollTop, left: container.scrollLeft });
    setViewport({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    // ResizeObserverでviewportを更新
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setViewport({ width: cr.width, height: cr.height });
    });
    ro.observe(container);

    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      container.removeEventListener("scroll", onScroll);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onScroll]);

  // キーボードイベントリスナー
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Canvas再描画
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // 編集中の入力フィールドの位置計算
  const editingInputStyle = useMemo(() => {
    if (!editingCell) return { display: "none" };

    // 仮想スクロール領域内での絶対座標を計算
    const cellX = ROW_HEADER_WIDTH + editingCell.col * COLUMN_WIDTH;
    const cellY = COLUMN_HEADER_HEIGHT + editingCell.row * ROW_HEIGHT;

    return {
      position: "absolute" as const,
      left: cellX,
      top: cellY,
      width: COLUMN_WIDTH,
      height: ROW_HEIGHT,
      border: "2px solid #007bff",
      fontSize: "14px",
      padding: "0 4px",
      margin: 0,
      outline: "none",
      backgroundColor: "white",
      zIndex: 1000,
      boxSizing: "border-box" as const,
    };
  }, [editingCell]);

  return (
    <div style={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          cursor: "cell",
        }}
      >
        {/* 仮想的なスクロール領域 */}
        <div
          style={{
            width: TOTAL_COLS * COLUMN_WIDTH + ROW_HEADER_WIDTH,
            height: TOTAL_ROWS * ROW_HEIGHT + COLUMN_HEADER_HEIGHT,
            position: "relative",
          }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />

          {/* 編集用入力フィールド */}
          {editingCell && (
            <input
              ref={inputRef}
              type="text"
              value={editingCell.value}
              onChange={(e) =>
                setEditingCell({ ...editingCell, value: e.target.value })
              }
              onBlur={handleEditComplete}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditComplete();
                } else if (e.key === "Escape") {
                  handleEditCancel();
                } else {
                  e.stopPropagation();
                }
              }}
              style={editingInputStyle}
            />
          )}
        </div>
      </div>

      {/* 操作説明 */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #e1e4e8",
          fontSize: "14px",
          color: "#586069",
        }}
      >
        <strong>操作方法:</strong> クリックでセル選択 |
        ダブルクリックまたはEnterで編集 | 矢印キーでナビゲーション |
        Escapeで選択解除
      </div>
    </div>
  );
}
