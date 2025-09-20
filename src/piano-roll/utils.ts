import {
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
  NOTE_PATTERN,
  OCTAVE_END,
  OCTAVE_START,
  WHITE_KEY_HEIGHT,
  WHITE_KEY_WIDTH,
  WHITE_KEYS_PER_OCTAVE,
} from "./constants";
import type { KeyInfo } from "./types";

export function calculateTotalWhiteKeys(): number {
  return (OCTAVE_END - OCTAVE_START + 1) * WHITE_KEYS_PER_OCTAVE;
}

export function generateKeys(): { whiteKeys: KeyInfo[]; blackKeys: KeyInfo[] } {
  const whiteKeys: KeyInfo[] = [];
  const blackKeys: KeyInfo[] = [];
  let whiteIndex = 0;

  for (let octave = OCTAVE_START; octave <= OCTAVE_END; octave += 1) {
    for (const pattern of NOTE_PATTERN) {
      if (pattern.kind === "white") {
        const x = whiteIndex * WHITE_KEY_WIDTH;
        whiteKeys.push({
          note: pattern.note,
          octave,
          x,
          kind: pattern.kind,
        });
        whiteIndex += 1;
      } else {
        if (whiteKeys.length === 0) {
          continue;
        }

        const prevWhite = whiteKeys[whiteKeys.length - 1];
        const nextWhiteX = whiteIndex * WHITE_KEY_WIDTH;
        const center = prevWhite.x + (nextWhiteX - prevWhite.x) / 2;
        const x = center - BLACK_KEY_WIDTH / 2;

        blackKeys.push({
          note: pattern.note,
          octave,
          x,
          kind: pattern.kind,
        });
      }
    }
  }

  return { whiteKeys, blackKeys };
}

/**
 * クリック位置からどのキーが押されたかを判定
 */
export function getKeyFromPosition(
  x: number,
  y: number,
  whiteKeys: KeyInfo[],
  blackKeys: KeyInfo[]
): KeyInfo | null {
  // 黒鍵を先にチェック（白鍵の上に重なっているため）
  for (const key of blackKeys) {
    const keyX = key.x + 13; // 黒鍵のオフセット
    if (
      x >= keyX &&
      x <= keyX + BLACK_KEY_WIDTH &&
      y >= 0 &&
      y <= BLACK_KEY_HEIGHT
    ) {
      return key;
    }
  }

  // 白鍵をチェック
  for (const key of whiteKeys) {
    if (
      x >= key.x &&
      x <= key.x + WHITE_KEY_WIDTH &&
      y >= 0 &&
      y <= WHITE_KEY_HEIGHT
    ) {
      return key;
    }
  }

  return null;
}
