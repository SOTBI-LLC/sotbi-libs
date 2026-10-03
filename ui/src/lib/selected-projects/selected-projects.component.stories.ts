import { ClarityIcons, starIcon } from '@clr/angular/icon';
import type { Meta, StoryObj } from '@storybook/angular';

import { SelectedProjectsComponent } from './selected-projects.component';

ClarityIcons.addIcons(starIcon);

const meta: Meta<SelectedProjectsComponent> = {
  title: 'SelectedProjects',
  component: SelectedProjectsComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SelectedProjectsComponent>;

export const WithFavorites: Story = {
  args: {
    all: '3',
    projects: [
      {
        id: 1,
        name: 'Стройка',
        debtors: [{ id: 11, name: 'ООО Рога' } as never],
      },
      {
        id: 2,
        name: 'Ремонт',
        debtors: [
          { id: 21, name: 'ИП Иванов' } as never,
          { id: 22, name: 'ООО Копыта' } as never,
        ],
      },
    ] as never,
  },
};

export const Empty: Story = {
  args: {
    all: '0',
    projects: [],
  },
};
