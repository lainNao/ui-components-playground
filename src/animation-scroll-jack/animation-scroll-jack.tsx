import { useEffect, useMemo, useRef, useState } from "react";

export default function AnimationScrollJack() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollJackContainerRef = useRef<HTMLDivElement>(null);
  const [scrollJackWidth, setScrollJackWidth] = useState(0);

  // スクロールジャック領域の幅をセット
  useEffect(() => {
    const scrollJackContainer = scrollJackContainerRef.current;
    if (!scrollJackContainer) return;
    const update = () => {
      setScrollJackWidth(scrollJackContainer.scrollWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(scrollJackContainer);
    return () => ro.disconnect();
  }, []);

  // wrapper の必要高さ = 100vh + (scrollJackWidth - vw)
  const wrapperHeight = useMemo(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    const span = Math.max(0, scrollJackWidth - vw);
    return vh + span;
  }, [scrollJackWidth]);

  // スクロール監視をして、必要に応じてスクロールジャック領域をtransform3dで横移動
  useEffect(() => {
    const onScroll = () => {
      if (!wrapperRef.current || !scrollJackContainerRef.current) {
        return;
      }

      const x = (() => {
        const rect = wrapperRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const maxX = Math.max(0, scrollJackWidth - vw);
        if (rect.top > 0) {
          // 上から来て、まだ sticky が top:0 に達していない間は 0
          return 0;
        } else if (rect.bottom < vh) {
          // sticky 区間を抜けたら最終位置で固定
          return maxX;
        } else {
          // 区間内：-rect.top が進捗、早期開始なし
          return Math.min(maxX, -rect.top);
        }
      })();

      scrollJackContainerRef.current.style.transform = `translate3d(${-x}px,0,0)`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollJackWidth]);

  return (
    <div>
      <section
        style={{
          height: "150vh",
          display: "grid",
          placeItems: "center",
          background: "steelblue",
          color: "#fff",
        }}
      >
        hero
      </section>

      <div ref={wrapperRef} style={{ height: wrapperHeight }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <div
            ref={scrollJackContainerRef}
            style={{
              display: "flex",
              height: "100%",
              transform: "translate3d(0,0,0)",
            }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: ok
                key={i}
                style={{
                  width: "100vw",
                  height: "100vh",
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  background: i % 2 === 0 ? "lightblue" : "lightgreen",
                  fontSize: 24,
                }}
              >
                Section {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section
        style={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#444",
          color: "#fff",
        }}
      >
        フッター
      </section>
    </div>
  );
}
