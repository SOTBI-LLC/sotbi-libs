import { provideAnimations } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';

import { CollapsibleBlockComponent, CollapsibleBlockModel } from './collapsible-block.component';

const meta: Meta<CollapsibleBlockComponent> = {
  title: 'CollapsibleBlock',
  component: CollapsibleBlockComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;

type Story = StoryObj<CollapsibleBlockComponent>;

export const Default: Story = {
  args: {
    block: new CollapsibleBlockModel({
      id: 'demo',
      title: 'Демо-блок',
      visible: true,
      editMode: false,
    }),
    canBeEdited: true,
    isChanged: false,
  },
};

export const Collapsed: Story = {
  args: {
    block: new CollapsibleBlockModel({
      id: 'demo-collapsed',
      title: 'Свёрнутый блок',
      visible: false,
      editMode: false,
    }),
    canBeEdited: true,
    isChanged: false,
  },
};
