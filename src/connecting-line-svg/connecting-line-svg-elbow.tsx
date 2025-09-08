export function ConnectingLineSvgElbow({
  startPoint,
  endPoint,
  radius = 16, // 角丸半径
  stroke = "black",
  strokeWidth = 2,
}: {
  startPoint: HTMLElement;
  endPoint: HTMLElement;
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const s = startPoint.getBoundingClientRect();
  const e = endPoint.getBoundingClientRect();

  const x1 = s.left + s.width / 2;
  const y1 = s.top + s.height / 2;
  const x2 = e.left + e.width / 2;
  const y2 = e.top + e.height / 2;

  const dx = Math.max(0, x2 - x1);
  const dy = Math.max(0, y2 - y1);
  const r = Math.max(0, Math.min(radius, dx / 2, dy / 2));

  // -90度 (反時計回り) の円弧に変更
  const d =
    r > 0
      ? `M ${x1} ${y1} L ${x1} ${y2 - r} A ${r} ${r} 0 0 0 ${
          x1 + r
        } ${y2} L ${x2} ${y2}`
      : `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <title>Connecting Line</title>
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}
