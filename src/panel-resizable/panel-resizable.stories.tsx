import type { Meta, StoryObj } from "@storybook/react";
import { PanelResizable } from "./panel-resizable";

const meta: Meta<typeof PanelResizable> = {
  component: PanelResizable,
};

export default meta;

type Story = StoryObj<typeof PanelResizable>;

export const Default: Story = {};
