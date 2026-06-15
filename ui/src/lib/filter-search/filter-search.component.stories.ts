import type { Meta, StoryObj } from '@storybook/angular';

import { FilterComponent } from './filter-search.component';

const meta: Meta<FilterComponent> = {
  title: 'FilterSearch',
  component: FilterComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<FilterComponent>;

export const Default: Story = {
  args: {
    checked: false,
    indeterminate: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    indeterminate: false,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
  },
};
