import type { Meta, StoryObj } from "@storybook/react";
import { FlipAnimation } from "./flip-animation";

const meta: Meta<typeof FlipAnimation> = {
  component: FlipAnimation,
};

export default meta;

type Story = StoryObj<typeof FlipAnimation>;

export const Default: Story = {};
