/**
 * Excel風の列名を取得
 */
export function getExcelLikeColumnName(num: number): string {
  let result = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let dividend = num + 1;

  while (dividend > 0) {
    const modulo = (dividend - 1) % alphabet.length;
    result = alphabet[modulo] + result;
    dividend = Math.floor((dividend - modulo) / alphabet.length);
  }

  return result;
}

/**
 * サンプルのセル値を生成
 */
export function generateSampleCellValues(
  rows: number,
  cols: number
): {
  defaultValue: string;
}[][] {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      defaultValue: `${getExcelLikeColumnName(j)}${i + 1}`,
    }))
  );
}
