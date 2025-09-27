import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const generateAsteriskPath = (
  width: number,
  height: number,
  roughness: number,
  pointInterval: number,
  lineProps: {
    v: LineProps; // 縦棒
    h: LineProps; // 横棒
    d1: LineProps; // 斜め棒1
    d2: LineProps; // 斜め棒2
  }
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.48; // アスタリスクのサイズ（さらに大きく）
  const barLength = radius * 2;
  const cornerRadius = lineProps.v.width * 0.3; // 角丸の半径

  // 外向きのノイズを追加する関数
  const addRoughness = (x: number, y: number) => {
    const noise = Math.random() * roughness;
    const angle = Math.random() * 2 * Math.PI;
    return {
      x: x + Math.cos(angle) * noise,
      y: y + Math.sin(angle) * noise,
    };
  };

  // 角丸四角形のSVGパスを生成
  const generateRoundedRectPath = (
    centerX: number,
    centerY: number,
    rectWidth: number,
    rectHeight: number,
    rotation: number
  ) => {
    const halfWidth = rectWidth / 2;
    const halfHeight = rectHeight / 2;
    const r = Math.min(cornerRadius, halfWidth, halfHeight); // 角丸半径の調整

    // 基本の角丸四角形のパス（SVGのrounded rectangle）
    let path = `M ${-halfWidth + r} ${-halfHeight}`;
    path += ` L ${halfWidth - r} ${-halfHeight}`;
    path += ` Q ${halfWidth} ${-halfHeight} ${halfWidth} ${-halfHeight + r}`;
    path += ` L ${halfWidth} ${halfHeight - r}`;
    path += ` Q ${halfWidth} ${halfHeight} ${halfWidth - r} ${halfHeight}`;
    path += ` L ${-halfWidth + r} ${halfHeight}`;
    path += ` Q ${-halfWidth} ${halfHeight} ${-halfWidth} ${halfHeight - r}`;
    path += ` L ${-halfWidth} ${-halfHeight + r}`;
    path += ` Q ${-halfWidth} ${-halfHeight} ${-halfWidth + r} ${-halfHeight}`;
    path += ` Z`;

    // ラフネスを追加するために、パスの各点に微小なノイズを適用
    if (roughness > 0) {
      // パスを点の配列に変換してラフネスを適用
      const roughPoints: Array<{ x: number; y: number }> = [];

      // 四角形の各辺を細分化して点を生成
      const segments = [
        // 上辺
        {
          startX: -halfWidth + r,
          startY: -halfHeight,
          endX: halfWidth - r,
          endY: -halfHeight,
        },
        // 右辺
        {
          startX: halfWidth,
          startY: -halfHeight + r,
          endX: halfWidth,
          endY: halfHeight - r,
        },
        // 下辺
        {
          startX: halfWidth - r,
          startY: halfHeight,
          endX: -halfWidth + r,
          endY: halfHeight,
        },
        // 左辺
        {
          startX: -halfWidth,
          startY: halfHeight - r,
          endX: -halfWidth,
          endY: -halfHeight + r,
        },
      ];

      segments.forEach((segment) => {
        const segmentLength = Math.sqrt(
          (segment.endX - segment.startX) ** 2 +
            (segment.endY - segment.startY) ** 2
        );
        const numPoints = Math.max(
          2,
          Math.round(segmentLength / pointInterval)
        );

        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const localX = segment.startX + (segment.endX - segment.startX) * t;
          const localY = segment.startY + (segment.endY - segment.startY) * t;

          // ラフネスを適用
          const roughPoint = addRoughness(localX, localY);
          roughPoints.push(roughPoint);
        }
      });

      // ラフな点からパスを再生成
      if (roughPoints.length > 0) {
        path = `M ${roughPoints[0].x} ${roughPoints[0].y}`;
        for (let i = 1; i < roughPoints.length; i++) {
          if (i === roughPoints.length - 1) {
            path += ` L ${roughPoints[i].x} ${roughPoints[i].y}`;
          } else {
            // 滑らかな曲線で接続
            const current = roughPoints[i];
            const next = roughPoints[i + 1];
            const cpx = (current.x + next.x) / 2;
            const cpy = (current.y + next.y) / 2;
            path += ` Q ${current.x} ${current.y} ${cpx} ${cpy}`;
          }
        }
        path += ` Z`;
      }
    }

    // 回転を適用
    if (rotation !== 0) {
      // パス内の座標を回転変換（簡単な実装として、transform属性を使用）
      return {
        path,
        transform: `rotate(${
          (rotation * 180) / Math.PI
        } ${centerX} ${centerY}) translate(${centerX} ${centerY})`,
      };
    } else {
      return {
        path,
        transform: `translate(${centerX} ${centerY})`,
      };
    }
  };

  // 4つの棒状四角形を生成（縦、横、斜め2本）
  const bars: Array<{ id: string; path: string; transform: string }> = [];

  // デフォルトの設定
  const defaultLineProps = {
    v: { length: barLength, width: lineProps.v.width },
    h: { length: barLength, width: lineProps.h.width },
    d1: { length: barLength, width: lineProps.d1.width },
    d2: { length: barLength, width: lineProps.d2.width },
  };

  const actualLineProps = lineProps || defaultLineProps;
  const lineConfigs = [
    { key: "v", rotation: 0, props: actualLineProps.v }, // 縦棒 (0度)
    { key: "h", rotation: Math.PI / 2, props: actualLineProps.h }, // 横棒 (90度)
    { key: "d1", rotation: Math.PI / 4, props: actualLineProps.d1 }, // 斜め棒1 (45度)
    { key: "d2", rotation: (Math.PI * 3) / 4, props: actualLineProps.d2 }, // 斜め棒2 (135度)
  ];

  lineConfigs.forEach((config) => {
    const barData = generateRoundedRectPath(
      centerX,
      centerY,
      config.props.width,
      config.props.length,
      config.rotation
    );
    bars.push({
      id: `bar-${config.key}-${config.rotation.toFixed(2)}`,
      ...barData,
    });
  });

  return bars;
};

type LineProps = {
  length: number;
  width: number;
};

type HandwritingLookAsteriskProps = React.HTMLAttributes<HTMLDivElement> & {
  fillColor: string;
  width: number; // SVGの幅
  height: number; // SVGの高さ
  roughness?: number;
  pointInterval?: number;
  lineProps: {
    v: LineProps; // 縦棒
    h: LineProps; // 横棒
    d1: LineProps; // 斜め棒1
    d2: LineProps; // 斜め棒2
  };
};

export function HandwritingLookAsterisk({
  fillColor,
  width,
  height,
  roughness = 3,
  pointInterval = 10,
  lineProps,
  style,
  ...divProps
}: HandwritingLookAsteriskProps) {
  const [containerSize, setContainerSize] = useState({
    width: width,
    height: height,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width,
          height,
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [width, height]);

  const asteriskBars = useMemo(() => {
    return generateAsteriskPath(
      containerSize.width,
      containerSize.height,
      roughness,
      pointInterval,
      lineProps
    );
  }, [
    containerSize.width,
    containerSize.height,
    roughness,
    pointInterval,
    lineProps,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width,
        height,
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
          display: "block",
        }}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Handwriting style asterisk"
      >
        {asteriskBars.map((bar) => (
          <path
            key={bar.id}
            d={bar.path}
            transform={bar.transform}
            fill={fillColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
