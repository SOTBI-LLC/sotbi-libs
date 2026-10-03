import { ClarityIcons, floppyIcon, pencilIcon, trashIcon } from '@clr/angular/icon';
import type { Meta, StoryObj } from '@storybook/angular';

import { SimpleEditComponent } from './simple-edit.component';

ClarityIcons.addIcons(pencilIcon, floppyIcon, trashIcon);

const meta: Meta<SimpleEditComponent> = {
  title: 'SimpleEdit',
  component: SimpleEditComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SimpleEditComponent>;

export const Default: Story = {
  args: {
    items: [
      { id: 1, name: 'Первый раздел' },
      { id: 2, name: 'Второй раздел' },
    ],
    allowedToDelete: false,
  },
};

export const WithDelete: Story = {
  args: {
    items: [
      { id: 1, name: 'Первый раздел' },
      { id: 2, name: 'Второй раздел' },
      { id: 3, name: 'Третий раздел' },
    ],
    allowedToDelete: true,
  },
};
