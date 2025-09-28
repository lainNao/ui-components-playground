import { useState } from "react";

const colorOptions = ["red", "blue", "green"] as const;

export function FlipAnimation() {
  const [checkedColors, setCheckedColors] = useState<string[]>([
    ...colorOptions,
  ]);

  const flip = (_checkedColors: string[]) => {
    const boxes: NodeListOf<HTMLDivElement> = document.querySelectorAll(".box");

    // 1. すべてのboxのスタイルを取得
    const boxStylesMap = new Map();
    boxes.forEach((box) => {
      const id = box.dataset.id;
      const style = box.getBoundingClientRect();
      boxStylesMap.set(id, style);
    });

    // 2. チェックされてないBoxをhiddenにする
    boxes.forEach((box) => {
      if (!box.dataset.color) {
        console.warn("boxにdata-color属性がありません", box);
        return;
      }
      box.classList.toggle(
        "hidden",
        !_checkedColors.includes(box.dataset.color)
      );
    });

    // それぞれのboxにアニメーションを適用
    boxes.forEach((box) => {
      // 3. 変更後のスタイルを取得
      const next = box.getBoundingClientRect();
      const prev = boxStylesMap.get(box.dataset.id);

      // display: noneとなっているboxはwidthが0かどうかで判別する
      // 出現するboxはFLIPさせずにふわっと表示
      if (prev.width === 0) {
        box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
        return;
      }

      // 4. 移動のアニメーションを適用
      box.animate(
        [
          {
            translate: `${prev.x - next.x}px ${prev.y - next.y}px`,
          },
          {
            translate: "0 0",
          },
        ],
        {
          duration: 400,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }
      );
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    const newCheckedColors = checked
      ? [...checkedColors, value]
      : checkedColors.filter((color) => color !== value);
    setCheckedColors(newCheckedColors);

    queueMicrotask(() => {
      flip(newCheckedColors);
    });
  };

  return (
    <div>
      <style>{`
        .box {
          width: 100px;
          height: 100px;
          margin: 8px;
          display: inline-block;
          background-color: gray;
          transition: opacity 0.2s ease;

          &[data-color="red"] {
            background-color: #eb727d;
          }
          &[data-color="blue"] {
            background-color: #72aee8;
          }
          &[data-color="green"] {
            background-color: #7de87d;
          }
        }
        .hidden {
          display: none;
        }
      `}</style>
      <div>
        {colorOptions.map((color) => (
          <label key={color}>
            <input
              type="checkbox"
              checked={checkedColors.includes(color)}
              name="color"
              value={color}
              onChange={handleChange}
            />
            {color}
          </label>
        ))}
      </div>

      <div>
        <div className="box" data-color="red" data-id="1"></div>
        <div className="box" data-color="blue" data-id="2"></div>
        <div className="box" data-color="green" data-id="3"></div>
        <div className="box" data-color="red" data-id="4"></div>
        <div className="box" data-color="blue" data-id="5"></div>
        <div className="box" data-color="green" data-id="6"></div>
        <div className="box" data-color="red" data-id="7"></div>
        <div className="box" data-color="blue" data-id="8"></div>
        <div className="box" data-color="green" data-id="9"></div>
        <div className="box" data-color="red" data-id="10"></div>
        <div className="box" data-color="blue" data-id="11"></div>
        <div className="box" data-color="green" data-id="12"></div>
        <div className="box" data-color="red" data-id="13"></div>
        <div className="box" data-color="blue" data-id="14"></div>
        <div className="box" data-color="green" data-id="15"></div>
        <div className="box" data-color="red" data-id="16"></div>
        <div className="box" data-color="blue" data-id="17"></div>
        <div className="box" data-color="green" data-id="18"></div>
        <div className="box" data-color="red" data-id="19"></div>
        <div className="box" data-color="blue" data-id="20"></div>
        <div className="box" data-color="green" data-id="21"></div>
        <div className="box" data-color="red" data-id="22"></div>
        <div className="box" data-color="blue" data-id="23"></div>
        <div className="box" data-color="blue" data-id="24"></div>
      </div>
    </div>
  );
}
