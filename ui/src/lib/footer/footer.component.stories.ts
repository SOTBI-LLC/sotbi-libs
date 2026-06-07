import type { Meta, StoryObj } from '@storybook/angular';

import { FooterComponent } from './footer.component';

/** Matches app footer chrome so #fafafa link/title colors stay readable. */
const footerBackdropStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#003559',
  padding: '1rem 1.5rem',
} as const;

const meta: Meta<FooterComponent> = {
  title: 'Footer',
  component: FooterComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    props: { ...args, footerBackdropStyle },
    template: `
      <div [style]="footerBackdropStyle">
        <app-footer></app-footer>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<FooterComponent>;

export const Default: Story = {};
