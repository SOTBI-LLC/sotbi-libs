import type { Meta, StoryObj } from '@storybook/angular';
import { LeftNavComponent } from './left-nav.component';
import { expect } from 'storybook/test';

const meta: Meta<LeftNavComponent> = {
  component: LeftNavComponent,
  title: 'LeftNavComponent',
};
export default meta;

type Story = StoryObj<LeftNavComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/left-nav/gi)).toBeTruthy();
  },
};
