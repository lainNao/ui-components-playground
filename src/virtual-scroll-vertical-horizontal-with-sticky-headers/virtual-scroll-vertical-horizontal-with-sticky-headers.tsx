import type React from "react";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { generateSampleCellValues, getExcelLikeColumnName } from "./util";

// --- 定数 ---
const ROW_HEIGHT = 32;
const COLUMN_WIDTH = 100;
const ROW_HEADER_WIDTH = 50;

const TOTAL_ROWS = 1000;
const TOTAL_COLS = 1000;

const VISIBLE_ROWS_BUFFER = 10;
const VISIBLE_COLS_BUFFER = 6;

const sampleCellValues = generateSampleCellValues(TOTAL_ROWS, TOTAL_COLS);

// --- SheetRow（横方向の仮想化をここで実施） ---
interface SheetRowProps {
  rowIndex: number;
  rowData: { defaultValue: string }[];
  startCol: number;
  endCol: number;
}

/**
 * 行コンポーネント
 * - 横方向の仮想スクロール周りの対応
 *   - startCol, endCol で可視範囲を受け取り、その範囲のセルだけ描画
 *   - 左右にスペーサ列を入れて、全体の幅を確保する
 * - React.memo で横の可視範囲に変化が無ければ再レンダリングしないようにする（若干の効果あり）
 */
const SheetRow: React.FC<SheetRowProps> = memo(
  ({ rowIndex, rowData, startCol, endCol }) => {
    const leftSpacerWidth = startCol * COLUMN_WIDTH;
    const rightSpacerWidth = Math.max(
      0,
      (TOTAL_COLS - (endCol + 1)) * COLUMN_WIDTH
    );

    return (
      <tr style={{ height: ROW_HEIGHT }}>
        {/* 行ヘッダー（左固定） */}
        <th
          className="sticky-y-axis"
          style={{
            width: ROW_HEADER_WIDTH,
            minWidth: ROW_HEADER_WIDTH,
            height: ROW_HEIGHT,
          }}
        >
          {rowIndex + 1}
        </th>

        {/* 左スペーサ列 */}
        <td
          className="spacer-col"
          style={{ width: leftSpacerWidth, minWidth: leftSpacerWidth }}
        />

        {/* 可視範囲のデータセル */}
        {Array.from({ length: endCol - startCol + 1 }, (_, k) => {
          const j = startCol + k;
          return (
            <td
              key={`${rowIndex}-${j}`}
              style={{ minWidth: COLUMN_WIDTH, width: COLUMN_WIDTH }}
            >
              <input
                type="text"
                defaultValue={rowData[j]?.defaultValue || ""}
                className="cell-input"
                id={`cell-${rowIndex}-${j}`}
              />
            </td>
          );
        })}

        {/* 右スペーサ列 */}
        <td
          className="spacer-col"
          style={{ width: rightSpacerWidth, minWidth: rightSpacerWidth }}
        />
      </tr>
    );
  },
  (prev, next) => {
    // 同じ行で、横の可視範囲に変化が無ければ再レンダリング回避
    // これがあることで確かに再レンダリングが減る
    // TODO: rowData の扱いをどうするか
    return (
      prev.rowIndex === next.rowIndex &&
      prev.startCol === next.startCol &&
      prev.endCol === next.endCol &&
      prev.rowData === next.rowData
    );
  }
);

export function VirtualScrollVerticalHorizontalWithStickyHeaders() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // viewport サイズだけ持つ
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // スクロール位置
  // 「スクロールのたびに更新は重いのではないか」と思うかもしれないが、更新を間引くので耐えられてそう
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const rafIdRef = useRef<number | null>(null);

  // 行の可視範囲
  const { startRow, endRow } = useMemo(() => {
    return {
      startRow: Math.max(
        0,
        Math.floor(scrollPosition.top / ROW_HEIGHT) - VISIBLE_ROWS_BUFFER
      ),
      endRow: Math.min(
        TOTAL_ROWS - 1,
        Math.ceil((scrollPosition.top + viewport.height) / ROW_HEIGHT) +
          VISIBLE_ROWS_BUFFER
      ),
    };
  }, [scrollPosition.top, viewport.height]);

  // 列の可視範囲（横方向仮想化の肝）
  const { startCol, endCol } = useMemo(() => {
    return {
      startCol: Math.max(
        0,
        Math.floor(scrollPosition.left / COLUMN_WIDTH) - VISIBLE_COLS_BUFFER
      ),
      endCol: Math.min(
        TOTAL_COLS - 1,
        Math.ceil(
          (scrollPosition.left + viewport.width - ROW_HEADER_WIDTH) /
            COLUMN_WIDTH
        ) + VISIBLE_COLS_BUFFER
      ),
    };
  }, [scrollPosition.left, viewport.width]);

  // レンダリングする行
  const renderedRows = useMemo(() => {
    const rows = [];
    for (let i = startRow; i <= endRow; i++) {
      rows.push(
        <SheetRow
          key={i}
          rowIndex={i}
          rowData={sampleCellValues[i]}
          startCol={startCol}
          endCol={endCol}
        />
      );
    }
    return rows;
  }, [startRow, endRow, startCol, endCol]);

  const onScroll = useCallback(() => {
    const sc = scrollContainerRef.current;
    if (!sc) {
      throw new Error("Scroll container not found");
    }

    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    /**
     * rAF で state 更新を間引くことで、パフォーマンス上毎回再レンダリングしても耐えられる
     * TODO:スペック低いPCで検証
     */
    rafIdRef.current = requestAnimationFrame(() => {
      setScrollPosition({ top: sc.scrollTop, left: sc.scrollLeft });
      rafIdRef.current = null;
    });
  }, []);

  // 初期化＆リサイズ監視
  useLayoutEffect(() => {
    const sc = scrollContainerRef.current;
    if (!sc) {
      throw new Error("Scroll container not found");
    }

    // 初期値
    setScrollPosition({ top: sc.scrollTop, left: sc.scrollLeft });
    setViewport({ width: sc.clientWidth, height: sc.clientHeight });

    // ResizeObserverで viewport を更新
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setViewport({ width: cr.width, height: cr.height });
    });
    ro.observe(sc);

    sc.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      sc.removeEventListener("scroll", onScroll);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onScroll]);

  // 各種サイズ計算
  const totalTableHeight = TOTAL_ROWS * ROW_HEIGHT + ROW_HEIGHT;
  const totalTableWidth = TOTAL_COLS * COLUMN_WIDTH + ROW_HEADER_WIDTH;
  const leftSpacerWidth = startCol * COLUMN_WIDTH;
  const rightSpacerWidth = Math.max(
    0,
    (TOTAL_COLS - (endCol + 1)) * COLUMN_WIDTH
  );
  const bottomSpacerHeight =
    Math.max(0, TOTAL_ROWS - (endRow + 1)) * ROW_HEIGHT;

  return (
    <>
      <div style={{ height: "90vh", display: "flex", flexDirection: "column" }}>
        <div
          ref={scrollContainerRef}
          className="sheet-container"
          style={{ flex: "1", overflow: "auto", position: "relative" }}
        >
          <table
            className="sheet-table-fixed"
            style={{ width: totalTableWidth, height: totalTableHeight }}
          >
            <thead>
              <tr>
                {/* 左上隅 */}
                <th className="sticky-corner" />

                {/* ヘッダー用 左スペーサ */}
                <th
                  className="spacer-col"
                  style={{
                    width: leftSpacerWidth,
                    minWidth: leftSpacerWidth,
                  }}
                />

                {/* 可視範囲の列ヘッダー */}
                {Array.from({ length: endCol - startCol + 1 }, (_, k) => {
                  const j = startCol + k;
                  return (
                    <th
                      key={`col-header-${j}`}
                      className="sticky-x-axis"
                      style={{ minWidth: COLUMN_WIDTH, width: COLUMN_WIDTH }}
                    >
                      {getExcelLikeColumnName(j)}
                    </th>
                  );
                })}

                {/* ヘッダー用 右スペーサ */}
                <th
                  className="spacer-col"
                  style={{
                    width: rightSpacerWidth,
                    minWidth: rightSpacerWidth,
                  }}
                />
              </tr>
            </thead>

            <tbody>
              {/* 上部スペーサ行 */}
              {startRow > 0 && (
                <tr style={{ height: startRow * ROW_HEIGHT }}>
                  <td
                    colSpan={
                      /* corner + spacers + 可視列 */
                      1 + 1 + (endCol - startCol + 1) + 1
                    }
                  />
                </tr>
              )}

              {/* 可視範囲の行 */}
              {renderedRows}

              {/* 下部スペーサ行 */}
              {bottomSpacerHeight > 0 && (
                <tr
                  style={{
                    height: Math.max(0, TOTAL_ROWS - (endRow + 1)) * ROW_HEIGHT,
                  }}
                >
                  <td colSpan={1 + 1 + (endCol - startCol + 1) + 1} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
          body, html, #root { margin: 0; padding: 0; height: 100%; font-family: sans-serif; overflow: hidden; }
          .sheet-container { 
            border: 1px solid #ccc; 
            contain: strict; /* パフォーマンス微改善（レイアウト計算の分離） */
          }

          .sheet-table-fixed { border-collapse: separate; border-spacing: 0; }
          .sheet-table-fixed th, .sheet-table-fixed td {
            height: ${ROW_HEIGHT}px; padding: 0; border: 1px solid #e1e1e1;
            border-width: 0 1px 1px 0; background-color: white; overflow: hidden;
            white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box;
          }

          /* sticky */
          .sheet-table-fixed th.sticky-y-axis { background-color: #f3f5f8; text-align: center; font-weight: normal;
            position: sticky; left: 0; z-index: 2; border-left: 1px solid #e1e1e1; border-bottom: 1px solid #e1e1e1; border-right: 1px solid #e1e1e1; min-width: ${ROW_HEADER_WIDTH}px; }
          .sheet-table-fixed th.sticky-x-axis { background-color: #f3f5f8; text-align: center; font-weight: normal;
            position: sticky; top: 0; z-index: 1; border-top: 1px solid #e1e1e1; border-right: 1px solid #e1e1e1; border-bottom: 1px solid #e1e1e1; min-width: ${COLUMN_WIDTH}px; }
          .sheet-table-fixed th.sticky-corner { background-color: #f3f5f8; position: sticky; top: 0; left: 0; z-index: 3;
            border: 1px solid #e1e1e1; width: ${ROW_HEADER_WIDTH}px; min-width: ${ROW_HEADER_WIDTH}px; }

          /* 入力 */
          .sheet-table-fixed .cell-input { margin: 0; border: none; width: 100%; height: 100%; padding: 0 4px; outline: none; box-sizing: border-box; background-color: transparent; }

          /* スペーサ行の td は高さ/枠線ゼロ（念のための保険） */
          .sheet-table-fixed tr.spacer-row > td {
            height: 0 !important;
            border: 0 !important;
            padding: 0 !important;
            line-height: 0 !important;
          }

          /* スペーサ列（境界線を消して軽量化） */
          .sheet-table-fixed .spacer-col { border: none; background: transparent; }
        `}</style>
    </>
  );
}
