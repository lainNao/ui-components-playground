import {
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
  WHITE_KEY_HEIGHT,
  WHITE_KEY_WIDTH,
} from "./constants";
import type { KeyInfo } from "./types";

export function setupCanvas(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number
): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get canvas context");
  }

  const dpr = window.devicePixelRatio || 1;

  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  context.save();
  context.scale(dpr, dpr);
  context.clearRect(0, 0, logicalWidth, logicalHeight);

  return context;
}

export function drawWhiteKeys(
  context: CanvasRenderingContext2D,
  whiteKeys: KeyInfo[],
  pressedKeys: KeyInfo[] = []
): void {
  context.lineWidth = 1;
  context.textAlign = "center";
  context.textBaseline = "bottom";

  for (const key of whiteKeys) {
    const isPressed = pressedKeys.some(
      (pressedKey) =>
        key.note === pressedKey.note && key.octave === pressedKey.octave
    );

    if (isPressed) {
      // 押されている状態: 手前に向かって斜めに沈んだ表現
      context.fillStyle = key.note === "C" ? "#e0e0e8" : "#ebebeb";

      // メインの沈んだキー部分を描画（台形状）
      context.beginPath();
      const pressDepth = 1; // 沈み込みの深さ（浅くする）
      const keyX = key.x;
      const keyY = 0;
      const keyWidth = WHITE_KEY_WIDTH;
      const keyHeight = WHITE_KEY_HEIGHT;

      // 台形を描画（奥は通常の幅、手前は少し狭くなる）
      context.moveTo(keyX, keyY); // 奥の左上
      context.lineTo(keyX + keyWidth, keyY); // 奥の右上
      context.lineTo(keyX + keyWidth - pressDepth, keyY + keyHeight); // 手前の右下
      context.lineTo(keyX + pressDepth, keyY + keyHeight); // 手前の左下
      context.closePath();
      context.fill();

      // 側面の影を描画（左側面）
      context.fillStyle = "rgba(0, 0, 0, 0.15)"; // 影も少し薄くする
      context.beginPath();
      context.moveTo(keyX, keyY);
      context.lineTo(keyX + pressDepth, keyY + keyHeight);
      context.lineTo(keyX + pressDepth + 1, keyY + keyHeight); // 幅を1pxに
      context.lineTo(keyX + 1, keyY); // 幅を1pxに
      context.closePath();
      context.fill();

      // 側面の影を描画（右側面）
      context.beginPath();
      context.moveTo(keyX + keyWidth, keyY);
      context.lineTo(keyX + keyWidth - 1, keyY); // 幅を1pxに
      context.lineTo(keyX + keyWidth - pressDepth - 1, keyY + keyHeight); // 幅を1pxに
      context.lineTo(keyX + keyWidth - pressDepth, keyY + keyHeight);
      context.closePath();
      context.fill();

      // 輪郭線を描画
      context.strokeStyle = "#b0b0b0";
      context.beginPath();
      context.moveTo(keyX, keyY);
      context.lineTo(keyX + keyWidth, keyY);
      context.lineTo(keyX + keyWidth - pressDepth, keyY + keyHeight);
      context.lineTo(keyX + pressDepth, keyY + keyHeight);
      context.closePath();
      context.stroke();
    } else {
      // 通常状態の見た目
      context.fillStyle = key.note === "C" ? "#f8f8ff" : "#fdfdfd";
      context.fillRect(key.x, 0, WHITE_KEY_WIDTH, WHITE_KEY_HEIGHT);

      context.strokeStyle = "#c7c7c7";
      context.strokeRect(
        key.x + 0.5,
        0.5,
        WHITE_KEY_WIDTH - 1,
        WHITE_KEY_HEIGHT - 1
      );
    }
  }
}

export function drawWhiteKeyLabels(
  context: CanvasRenderingContext2D,
  whiteKeys: KeyInfo[]
): void {
  context.fillStyle = "#3d3d3d";
  context.font = "12px system-ui, sans-serif";

  for (const key of whiteKeys) {
    if (key.note !== "C") {
      continue;
    }
    const label = `${key.note}${key.octave}`;
    context.fillText(label, key.x + WHITE_KEY_WIDTH / 2, WHITE_KEY_HEIGHT - 8);
  }
}

export function drawBlackKeys(
  context: CanvasRenderingContext2D,
  blackKeys: KeyInfo[],
  pressedKeys: KeyInfo[] = []
): void {
  for (const key of blackKeys) {
    const isPressed = pressedKeys.some(
      (pressedKey) =>
        key.note === pressedKey.note && key.octave === pressedKey.octave
    );

    let blackGradient: CanvasGradient;

    if (isPressed) {
      // 押されている時のグラデーション（より暗く）
      blackGradient = context.createLinearGradient(0, 0, 0, BLACK_KEY_HEIGHT);
      blackGradient.addColorStop(0, "#3a3a3a");
      blackGradient.addColorStop(0.5, "#0a0a0a");
      blackGradient.addColorStop(1, "#000000");
    } else {
      // 通常時のグラデーション
      blackGradient = context.createLinearGradient(0, 0, 0, BLACK_KEY_HEIGHT);
      blackGradient.addColorStop(0, "#5b5b5b");
      blackGradient.addColorStop(0.5, "#1d1d1d");
      blackGradient.addColorStop(1, "#050505");
    }

    context.fillStyle = blackGradient;
    context.fillRect(key.x + 13, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);

    // 押されている時は少し小さく見せる
    if (isPressed) {
      context.fillStyle = "rgba(0, 0, 0, 0.3)";
      context.fillRect(
        key.x + 15,
        2,
        BLACK_KEY_WIDTH - 4,
        BLACK_KEY_HEIGHT - 4
      );
    }

    context.strokeStyle = "#050505";
    context.strokeRect(
      key.x + 13,
      0.5,
      BLACK_KEY_WIDTH - 1,
      BLACK_KEY_HEIGHT - 1
    );
  }
}
