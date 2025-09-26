import { Fragment, useEffect, useState } from "react";

interface Item {
  id: string;
  text: string;
}

const initialItems = [
  { id: "1", text: "Item 1" },
  { id: "2", text: "Item 2" },
  { id: "3", text: "Item 3" },
  { id: "4", text: "Item 4" },
  { id: "5", text: "Item 5" },
];

export function DndListReorder() {
  const [orderedItems, setOrderedItems] = useState<Item[]>(initialItems);
  const [grabbedItemId, setGrabbedItemId] = useState<string | undefined>(
    undefined
  );
  const [grabbedItemOriginalRect, setGrabbedItemOriginalRect] =
    useState<DOMRect | null>(null);
  const [grabStartMousePos, setGrabStartMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // マウスダウンで、アイテムを掴む
  const handleMouseDownItem = (id: string, event: React.MouseEvent) => {
    setGrabbedItemId(id);
    setGrabbedItemOriginalRect(event.currentTarget.getBoundingClientRect());
    setGrabStartMousePos({ x: event.clientX, y: event.clientY });

    const grabbedElement = document.querySelector(
      `[data-item-id='${id}']`
    ) as HTMLDivElement | null;
    if (!grabbedElement) return;

    grabbedElement.style.setProperty(
      "top",
      `${event.currentTarget.getBoundingClientRect().top}px`
    );
    grabbedElement.style.setProperty(
      "left",
      `${event.currentTarget.getBoundingClientRect().left}px`
    );
  };

  // マウスオーバーで、掴んでいるアイテムをその位置に移動する
  const handleMouseOverItem = (id: string) => {
    if (!grabbedItemId || grabbedItemId === id) return;

    setOrderedItems((items) => {
      const newItems = [...items];
      const grabbedIndex = newItems.findIndex(
        (item) => item.id === grabbedItemId
      );
      const overIndex = newItems.findIndex((item) => item.id === id);

      if (grabbedIndex === -1 || overIndex === -1) return items;

      // 掴んでいるアイテムを一時的に取り出す
      const [grabbedItem] = newItems.splice(grabbedIndex, 1);
      // 掴んでいるアイテムをマウスオーバーしている位置に挿入する
      newItems.splice(overIndex, 0, grabbedItem);

      return newItems;
    });
  };

  // マウスアップで掴んでいるアイテムを離す
  useEffect(() => {
    const handleMouseUp = () => {
      const grabbedElement = document.querySelector(
        `[data-item-id='${grabbedItemId}']`
      ) as HTMLDivElement | null;
      if (!grabbedElement) return;

      // 位置をリセット
      grabbedElement.style.removeProperty("left");
      grabbedElement.style.removeProperty("top");

      setGrabbedItemId(undefined);
      setGrabbedItemOriginalRect(null);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (grabbedItemId && grabbedItemOriginalRect) {
        const grabbedElement = document.querySelector(
          `[data-item-id='${grabbedItemId}']`
        ) as HTMLDivElement | null;
        if (!grabbedElement) return;

        const moveX = event.clientX - (grabStartMousePos?.x || 0);
        const moveY = event.clientY - (grabStartMousePos?.y || 0);

        grabbedElement.style.setProperty(
          "top",
          `${grabbedItemOriginalRect.top + moveY}px`
        );
        grabbedElement.style.setProperty(
          "left",
          `${grabbedItemOriginalRect.left + moveX}px`
        );
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [grabbedItemId, grabbedItemOriginalRect, grabStartMousePos]);

  return (
    <>
      <style>
        {`
        .list-item {
          position: relative;
          padding: 12px 16px;
          border: 2px solid;
          border-radius: 8px;
          cursor: grab;
          user-select: none;
          z-index: 1;
          transition: background-color 0.1s ease, transform 0.1s ease;
          
          &:hover {
            background-color: lightgrey;
          }

          &.grabbed {
            position: fixed !important;
            z-index: 1000;
            background-color: #e3f2fd;
            opacity: 0.9;
            transform: scale(1.02);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            pointer-events: none;
          }

          &.placeholder {
            opacity: 0.5;
            background-color: #f5f5f5;
            border-style: dashed;
          }
        }
      `}
      </style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {orderedItems.map((item) => {
          const isGrabbed = item.id === grabbedItemId;

          return (
            <Fragment key={item.id}>
              {/* プレースホルダー要素: 掴んでいるアイテムのスペースを確保 */}
              {isGrabbed && (
                <div
                  style={{
                    height: grabbedItemOriginalRect?.height || "auto",
                    width: "100%",
                  }}
                >
                  {/* 何も描画しないプレースホルダー */}
                </div>
              )}

              {/* biome-ignore lint/a11y/noStaticElementInteractions: アニメーションのためには仕方ない */}
              {/* biome-ignore lint/a11y/useKeyWithMouseEvents: アニメーションのためには仕方ない */}
              <div
                data-item-id={item.id}
                className={`
                    list-item
                    ${isGrabbed ? "grabbed" : ""}
                  `}
                onMouseDown={(e) => handleMouseDownItem(item.id, e)}
                onMouseOver={() => handleMouseOverItem(item.id)}
                style={
                  isGrabbed && grabbedItemOriginalRect
                    ? {
                        position: "fixed",
                        height: grabbedItemOriginalRect.height,
                        width: grabbedItemOriginalRect.width,
                        boxSizing: "border-box",
                      }
                    : {}
                }
              >
                {item.text}
              </div>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
