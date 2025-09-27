import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const generateRoughPath = (
  width: number,
  height: number,
  roughness: number,
  squareness: number,
  pointInterval: number
) => {
  // 円ベースで四角っぽくする関数
  const createEllipseWithSquareness = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    // 弧長ベースで均等な点配置を実現
    const points: number[][] = [];

    // 小さな刻みで弧長を計算
    const segments = 1000;
    let totalArcLength = 0;
    const arcLengths: number[] = [0];

    for (let i = 1; i <= segments; i++) {
      const prevAngle = (2 * Math.PI * (i - 1)) / segments;
      const currAngle = (2 * Math.PI * i) / segments;

      const prevX = radiusX * Math.cos(prevAngle);
      const prevY = radiusY * Math.sin(prevAngle);
      const currX = radiusX * Math.cos(currAngle);
      const currY = radiusY * Math.sin(currAngle);

      const segmentLength = Math.sqrt(
        (currX - prevX) ** 2 + (currY - prevY) ** 2
      );
      totalArcLength += segmentLength;
      arcLengths.push(totalArcLength);
    }

    // 等間隔の点を配置
    const totalPoints = Math.max(
      32,
      Math.round(totalArcLength / pointInterval)
    );

    // 開始角度を少しずらして右端の尖りを回避
    const startAngleOffset = Math.PI / 4; // 45度ずらす

    for (let i = 0; i < totalPoints; i++) {
      const targetLength = (i / totalPoints) * totalArcLength;

      // 対応する角度を見つける
      let segmentIndex = 0;
      for (let j = 1; j < arcLengths.length; j++) {
        if (arcLengths[j] >= targetLength) {
          segmentIndex = j - 1;
          break;
        }
      }

      const ratio = segmentIndex / segments;
      let angle = 2 * Math.PI * ratio + startAngleOffset;

      // 角度を0-2πの範囲に正規化
      angle = angle % (2 * Math.PI); // 基本の楕円座標
      let x = centerX + radiusX * Math.cos(angle);
      let y = centerY + radiusY * Math.sin(angle);

      // squarenessで四角っぽくする（superellipse風）
      if (squareness > 0) {
        const n = 2 + squareness * 8; // 2(円)から10(四角に近い)
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        const signX = cosAngle >= 0 ? 1 : -1;
        const signY = sinAngle >= 0 ? 1 : -1;

        const superX = signX * Math.abs(cosAngle) ** (2 / n);
        const superY = signY * Math.abs(sinAngle) ** (2 / n);

        x = centerX + radiusX * superX;
        y = centerY + radiusY * superY;
      }

      // 外向きのroughnessを追加
      const outwardNoise = Math.random() * roughness;
      const normalX =
        (x - centerX) / Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const normalY =
        (y - centerY) / Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      x += normalX * outwardNoise;
      y += normalY * outwardNoise;

      points.push([x, y]);
    }

    return points;
  };

  const points = createEllipseWithSquareness();

  // SVGパスを生成（滑らかな曲線で）
  if (points.length < 3) return "";

  let path = `M ${points[0][0]} ${points[0][1]}`;

  // 最初の曲線
  const cp1x = (points[0][0] + points[1][0]) / 2;
  const cp1y = (points[0][1] + points[1][1]) / 2;
  path += ` Q ${points[1][0]} ${points[1][1]} ${cp1x} ${cp1y}`;

  // 中間の曲線（スムージング）
  for (let i = 1; i < points.length - 1; i++) {
    const cpx = (points[i][0] + points[i + 1][0]) / 2;
    const cpy = (points[i][1] + points[i + 1][1]) / 2;
    path += ` Q ${points[i][0]} ${points[i][1]} ${cpx} ${cpy}`;
  }

  // 最後の点から開始点へ滑らかに接続
  const lastIdx = points.length - 1;

  // 最後の制御点を計算
  const lastCpx = (points[lastIdx][0] + points[0][0]) / 2;
  const lastCpy = (points[lastIdx][1] + points[0][1]) / 2;
  path += ` Q ${points[lastIdx][0]} ${points[lastIdx][1]} ${lastCpx} ${lastCpy}`;

  // 開始点に戻る際も滑らかに
  const firstCpx = (points[0][0] + points[1][0]) / 2;
  const firstCpy = (points[0][1] + points[1][1]) / 2;
  path += ` Q ${points[0][0]} ${points[0][1]} ${firstCpx} ${firstCpy}`;
  path += " Z";

  return path;
};

type HandwritingLookContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness?: number;
  squareness?: number; // 0-1 の値で四角っぽくする度合いを制御（0=完全な円、1=四角に近い）
  pointInterval?: number; // 点の間隔（デフォルト20ピクセル）
  animationFps?: number; // 1秒にn回パスを再生成（デフォルト2回）
};

export function HandwritingLookContainerAnimated({
  strokeColor,
  fillColor,
  strokeWidth,
  roughness = 5,
  squareness = 0.2,
  pointInterval = 20,
  animationFps = 2,
  children,
  style,
  ...divProps
}: HandwritingLookContainerProps) {
  const [containerSize, setContainerSize] = useState({
    width: 300,
    height: 200,
  });
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: Math.max(100, rect.width || 300),
          height: Math.max(100, rect.height || 200),
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // アニメーション用のタイマー
  useEffect(() => {
    if (animationFps <= 0) return;

    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, 1000 / animationFps);

    return () => clearInterval(interval);
  }, [animationFps]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 直してもいいがここは一旦無視
  const svgPath = useMemo(() => {
    return generateRoughPath(
      containerSize.width,
      containerSize.height,
      roughness,
      squareness,
      pointInterval
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerSize.width,
    containerSize.height,
    roughness,
    squareness,
    pointInterval,
    animationTrigger, // アニメーショントリガーを依存関係に追加（意図的）
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: '"Comic Sans MS", "Marker Felt", cursive',
        ...style,
      }}
      {...divProps}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        preserveAspectRatio="xMidYMid slice"
        vectorEffect="non-scaling-stroke"
        role="img"
        aria-label="Handwriting style border"
      >
        <path
          d={svgPath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        style={{
          position: "relative",
          padding: "20px 30px",
          zIndex: 1,
          color: strokeColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
