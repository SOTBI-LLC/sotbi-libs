import type { Meta, StoryObj } from '@storybook/angular';

import { ProjectDebtorTreeComponent } from './project-debtor-tree.component';

const meta: Meta<ProjectDebtorTreeComponent> = {
  title: 'ProjectDebtorTree',
  component: ProjectDebtorTreeComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ProjectDebtorTreeComponent>;

export const Default: Story = {
  args: {
    all: 4,
    projects: [
      {
        id: 1,
        name: 'Стройка',
        selected: false,
        debtors: [
          { id: 11, name: 'ООО Рога', selected: false },
          { id: 12, name: 'ООО Копыта', selected: false },
        ],
      },
      {
        id: 2,
        name: 'Ремонт',
        selected: false,
        debtors: [{ id: 21, name: 'ИП Иванов', selected: false }],
      },
    ] as never,
  },
};
