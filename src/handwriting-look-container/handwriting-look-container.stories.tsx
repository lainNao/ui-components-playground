import type { Meta } from "@storybook/react";
import { HandwritingLookContainer } from "./handwriting-look-container";
import { HandwritingLookContainerAnimated } from "./handwriting-look-container-animated";

const meta: Meta<typeof HandwritingLookContainer> = {
  component: HandwritingLookContainer,
};

export default meta;

export const Default = () => {
  return (
    <HandwritingLookContainer
      strokeColor="#333"
      fillColor="#cfe6f5"
      strokeWidth={0}
      roughness={6}
      squareness={0.2}
      pointInterval={20}
      style={{
        padding: 20,
      }}
    >
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
    </HandwritingLookContainer>
  );
};

export const Animated = () => {
  return (
    <HandwritingLookContainerAnimated
      strokeColor="#333"
      fillColor="#cfe6f5"
      strokeWidth={0}
      roughness={6}
      squareness={0.2}
      pointInterval={20}
      animationFps={10}
      style={{
        padding: 20,
      }}
    >
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
      手書き風のコンテナです！ 手書き風のコンテナです！ 手書き風のコンテナです！
    </HandwritingLookContainerAnimated>
  );
};
