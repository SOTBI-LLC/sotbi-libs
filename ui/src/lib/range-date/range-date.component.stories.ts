import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { RangeDateComponent } from './range-date.component';

const meta: Meta<RangeDateComponent> = {
  title: 'RangeDate',
  component: RangeDateComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideNoopAnimations()],
    }),
  ],
};

export default meta;

type Story = StoryObj<RangeDateComponent>;

export const Regular: Story = {
  args: {
    start: new Date(2026, 9, 1),
    end: new Date(2026, 9, 31),
  },
};

export const Analytics: Story = {
  args: {
    analytics: true,
    start: new Date(2026, 8, 1),
    end: new Date(2026, 9, 1),
  },
};
