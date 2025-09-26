import { useRef } from "react";

export function PanelResizable() {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseDownBorder = (event: React.MouseEvent) => {
    const startX = event.clientX;
    const startWidth = leftPaneRef.current?.offsetWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (leftPaneRef.current) {
        leftPaneRef.current.style.width = `${startWidth + deltaX}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <style>
        {`
        .panel-border {
          cursor: col-resize;
          background-color: #ccc;
          width: 2px;
          margin-left: 1px;
          margin-right: 1px;
          transition: background-color 0.2s, width 0.2s, margin 0.2s;
        }
        .panel-border:hover {
          background-color: lightblue;
          width: 4px;
          margin-left: 0px;
          margin-right: 0px;
        }
      `}
      </style>

      <div
        style={{ display: "flex", width: "100%", height: "100vh", gap: "8px" }}
      >
        <div
          ref={leftPaneRef}
          style={{
            width: "100px",
          }}
        >
          left pane
        </div>

        {/** biome-ignore lint/a11y/noStaticElementInteractions: 仕方ない */}
        <div
          ref={borderRef}
          className="panel-border"
          onMouseDown={handleMouseDownBorder}
        />

        <div>right pane</div>
      </div>
    </>
  );
}
