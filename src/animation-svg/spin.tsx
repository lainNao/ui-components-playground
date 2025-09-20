export function Spin() {
  return (
    <div
      style={{
        width: "200px",
        height: "200px",
      }}
    >
      <style>
        {`
          /* ダッシュの開始位置の移動 */
          @keyframes spinAnimation {
            from {
              stroke-dashoffset: 0;
            }
            to {
              stroke-dashoffset: 31.3;
            }
          }

          /* 線幅のアニメーション */
          @keyframes pulseAnimation {
            0% {
              stroke-width: 5px;
            }
            100% {
              stroke-width: 24px;
            }
          }

          circle {
            stroke: black;
            stroke-dasharray: 0, 31.3; /* 線長, 線間の幅 */
            stroke-linecap: round; /* 端を丸くする */
            fill: transparent;
            animation: spinAnimation 1s ease infinite
              , pulseAnimation 0.5s ease-in-out infinite alternate;
          }

          
        `}
      </style>
      <svg viewBox="0 0 200 200">
        <title>SVG Animation Example</title>
        <circle cx="100" cy="100" r="50" />
      </svg>
    </div>
  );
}
