import { useId } from "react";
export function Flow() {
  const markerId = useId();
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
              stroke-dashoffset: -20;
            }
          }


          line {
            stroke: orangered;
            stroke-width: 5px;
            stroke-dasharray: 10, 10; /* 線長, 線間の幅 */
            stroke-linecap: round; /* 端を丸くする */
            fill: transparent;
            animation: spinAnimation 0.6s ease infinite;
          }

          ${`#${markerId}`} path {
            fill: orangered;
            stroke-linejoin: round;
          }
        `}
      </style>
      <svg viewBox="0 0 220 220">
        <title>SVG Animation Example</title>

        {/* 矢印の先 */}
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L12,5 L0,10 Z" />
          </marker>
        </defs>

        <line
          x1="10"
          y1="100"
          x2="200"
          y2="100"
          // 矢印の先を使う
          marker-end={`url(#${markerId})`}
        />
      </svg>
    </div>
  );
}
