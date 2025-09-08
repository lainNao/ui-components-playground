export function ConnectingLineSvgStraight({
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
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="2" />
    </svg>
  );
}
