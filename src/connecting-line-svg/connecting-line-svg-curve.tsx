export function ConnectingLineSvgCurve({
  startPoint,
  endPoint,
}: {
  startPoint: HTMLElement;
  endPoint: HTMLElement;
}) {
  const startRect = startPoint.getBoundingClientRect();
  const endRect = endPoint.getBoundingClientRect();

  const x1 = startRect.left + startRect.width / 2;
  const y1 = startRect.top + startRect.height / 2;
  const x2 = endRect.left + endRect.width / 2;
  const y2 = endRect.top + endRect.height / 2;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <title>Connecting Line</title>
      <path
        d={`M ${x1} ${y1} C ${x1 + 100} ${y1 - 100}, ${x2 - 100} ${
          y2 + 100
        }, ${x2} ${y2}`}
        stroke="black"
        strokeWidth="2"
        fill="transparent"
      />
    </svg>
  );
}
