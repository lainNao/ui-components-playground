import type { Meta, StoryObj } from "@storybook/react";
import { DndListReorder } from "./dnd-list-reorder";

const meta: Meta<typeof DndListReorder> = {
  component: DndListReorder,
};

export default meta;

type Story = StoryObj<typeof DndListReorder>;

export const Default: Story = {};
