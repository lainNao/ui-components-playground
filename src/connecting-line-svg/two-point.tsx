import { useEffect, useRef, useState } from "react";

export function TwoPointContainer({
  children,
}: {
  children: (args: {
    startPointRef: React.RefObject<HTMLDivElement | null>;
    endPointRef: React.RefObject<HTMLDivElement | null>;
  }) => React.ReactNode;
}): React.ReactNode {
  const startPointRef = useRef<HTMLDivElement>(null);
  const endPointRef = useRef<HTMLDivElement>(null);
  const [_, setRerender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRerender((v) => v + 1);
    }, 0);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: "500px",
        height: "500px",
      }}
    >
      {/* point 1 */}
      <div
        ref={startPointRef}
        style={{
          position: "absolute",
          top: "100px",
          left: "100px",
          width: "10px",
          height: "10px",
          backgroundColor: "red",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
        }}
      />
      {/* point 2 */}
      <div
        ref={endPointRef}
        style={{
          position: "absolute",
          top: "300px",
          left: "300px",
          width: "10px",
          height: "10px",
          backgroundColor: "blue",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
        }}
      />

      {children({
        startPointRef,
        endPointRef,
      })}
    </div>
  );
}
