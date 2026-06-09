import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { FilterBlockComponent } from './filter-block.component';

const meta: Meta<FilterBlockComponent> = {
  title: 'FilterBlock',
  component: FilterBlockComponent,
  tags: ['autodocs'],
  args: {
    clear: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <filter-block
        [title]="title"
        [selectedText]="selectedText"
        [clearText]="clearText"
        [showClear]="showClear"
        [heightAuto]="heightAuto"
        (clear)="clear()"
      >
        <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; color: #565656;">
          Содержимое слота (ng-content): поля фильтра, списки, чекбоксы
        </div>
      </filter-block>
    `,
  }),
};

export default meta;

type Story = StoryObj<FilterBlockComponent>;

export const Default: Story = {
  args: {
    title: 'Период',
    selectedText: '01.01.2025 – 31.01.2025',
    clearText: 'очистить',
    showClear: true,
    heightAuto: false,
  },
};

export const WithoutClearButton: Story = {
  args: {
    ...Default.args,
    title: 'Статус',
    selectedText: 'Все статусы',
    showClear: false,
  },
};

export const EmptySelection: Story = {
  args: {
    ...Default.args,
    title: 'Контрагент',
    selectedText: '',
    showClear: true,
  },
};

export const CustomClearLabel: Story = {
  args: {
    ...Default.args,
    title: 'Менеджер',
    selectedText: 'Иванов И.И.',
    clearText: 'сбросить',
  },
};
