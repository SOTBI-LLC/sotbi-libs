import type { Meta, StoryObj } from '@storybook/angular';

import { TimeEditComponent } from './time-edit.component';

const meta: Meta<TimeEditComponent> = {
  title: 'TimeEdit',
  component: TimeEditComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<TimeEditComponent>;

export const Default: Story = {};
