import type { Meta, StoryObj } from '@storybook/angular';

import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'ProgressBar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ProgressBarComponent>;

export const Segmented: Story = {
  args: {
    progress: { value: 66, status: [1, 1, 0, 1] },
    showProgress: true,
  },
};

export const Plain: Story = {
  args: {
    progress: { value: 25, status: [1, 0] },
    showProgress: false,
  },
};
