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

export function DndListReorderFlipAnimation() {
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

  // FLIP アニメーション関数
  const performFlipAnimation = (
    oldPositions: Map<string, DOMRect>,
    newItems: Item[]
  ) => {
    // 新しい位置を取得
    const newPositions = new Map<string, DOMRect>();
    newItems.forEach((item) => {
      const element = document.querySelector(
        `[data-item-id='${item.id}']`
      ) as HTMLElement;
      if (element && item.id !== grabbedItemId) {
        newPositions.set(item.id, element.getBoundingClientRect());
      }
    });

    // 各要素をアニメーションする
    newPositions.forEach((newRect, itemId) => {
      const oldRect = oldPositions.get(itemId);
      const element = document.querySelector(
        `[data-item-id='${itemId}']`
      ) as HTMLElement;

      if (oldRect && element && itemId !== grabbedItemId) {
        // 移動距離を計算
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        // 移動がない場合はアニメーションしない
        if (deltaX === 0 && deltaY === 0) return;

        // 元の位置に瞬間移動
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        element.style.transition = "none";

        // 新位置へのアニメーション開始
        requestAnimationFrame(() => {
          element.style.transition = "transform 0.2s ease-out";
          element.style.transform = "translate(0px, 0px)";
        });
      }
    });
  };

  // マウスオーバーで、掴んでいるアイテムをその位置に移動する
  const handleMouseOverItem = (id: string) => {
    if (!grabbedItemId || grabbedItemId === id) return;

    const oldPositions = new Map<string, DOMRect>();
    orderedItems.forEach((item) => {
      const element = document.querySelector(
        `[data-item-id='${item.id}']`
      ) as HTMLElement;
      if (element && item.id !== grabbedItemId) {
        oldPositions.set(item.id, element.getBoundingClientRect());
      }
    });

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

      // FLIP開始
      queueMicrotask(() => performFlipAnimation(oldPositions, newItems));

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
            transition: none !important;
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
