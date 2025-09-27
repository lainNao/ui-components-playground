import type { Meta } from "@storybook/react";
import { HandwritingLookAsterisk } from "./handwriting-look-asterisk";
import { HandwritingLookAsteriskAnimated } from "./handwriting-look-asterisk-animated";

const meta: Meta<typeof HandwritingLookAsterisk> = {
  component: HandwritingLookAsterisk,
};

export default meta;

export const Default = () => {
  const maxHeight = 100;
  const maxWidth = 65;
  return (
    <HandwritingLookAsterisk
      fillColor="#eb727d"
      roughness={3}
      pointInterval={10}
      width={65}
      height={100}
      lineProps={{
        v: { length: maxHeight, width: 13 },
        h: { length: maxWidth, width: 13 },
        d1: { length: maxWidth, width: 13 },
        d2: { length: maxWidth, width: 13 },
      }}
    />
  );
};

export const Animated = () => {
  const maxHeight = 100;
  const maxWidth = 65;

  return (
    <HandwritingLookAsteriskAnimated
      fillColor="#eb727d"
      roughness={2}
      pointInterval={10}
      width={maxWidth}
      height={maxHeight}
      animationFps={10}
      lineProps={{
        v: { length: maxHeight, width: 13 }, // 縦棒
        h: { length: maxWidth, width: 13 }, // 横棒
        d1: { length: maxWidth, width: 13 }, // 斜め棒1
        d2: { length: maxWidth, width: 13 }, // 斜め棒2
      }}
    />
  );
};
