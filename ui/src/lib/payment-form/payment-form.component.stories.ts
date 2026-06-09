import type { Meta, StoryObj } from '@storybook/angular';
import { PaymentFormComponent } from './payment-form.component';
import { expect } from 'storybook/test';

const meta: Meta<PaymentFormComponent> = {
  component: PaymentFormComponent,
  title: 'PaymentFormComponent',
};
export default meta;

type Story = StoryObj<PaymentFormComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/payment-form/gi)).toBeTruthy();
  },
};
