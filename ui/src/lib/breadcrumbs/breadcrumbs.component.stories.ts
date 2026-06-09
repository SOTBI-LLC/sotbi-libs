import type { Meta, StoryObj } from '@storybook/angular';

import { BreadcrumbsComponent } from './breadcrumbs.component';

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Breadcrumbs',
  component: BreadcrumbsComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<BreadcrumbsComponent>;

export const Default: Story = {
  args: {
    path: ['Главная', 'Раздел', 'Страница'],
  },
};
