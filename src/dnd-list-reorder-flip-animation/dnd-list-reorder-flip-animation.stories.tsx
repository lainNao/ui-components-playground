import type { Meta, StoryObj } from "@storybook/react";
import { DndListReorderFlipAnimation } from "./dnd-list-reorder-flip-animation";

const meta: Meta<typeof DndListReorderFlipAnimation> = {
  component: DndListReorderFlipAnimation,
};

export default meta;

type Story = StoryObj<typeof DndListReorderFlipAnimation>;

export const Default: Story = {};
