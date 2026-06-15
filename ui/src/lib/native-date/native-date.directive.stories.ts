import { DatePipe, formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';

import { YYYY_MM_DD } from '@sotbi/utils';
import { NativeDateValueAccessorDirective } from './native-date.directive';

@Component({
  selector: 'lib-native-date-demo',
  standalone: true,
  imports: [NativeDateValueAccessorDirective, FormsModule, DatePipe],
  template: `
    <label class="flex flex-col gap-2 max-w-xs">
      <span>{{ label }}</span>
      <input
        type="date"
        nativeDate
        [(ngModel)]="dateValue"
        [attr.min]="min || null"
        [attr.max]="max || null"
      />
    </label>
    @if (min || max) {
      <p class="mt-1 text-xs text-gray-500">
        Разрешено: с {{ min || '…' }} по {{ max || '…' }}
      </p>
    }
    <p class="mt-2 text-sm text-gray-600">
      Модель: {{ dateValue ? (dateValue | date: 'mediumDate') : '—' }}
    </p>
  `,
})
class NativeDateDemoComponent {
  @Input()
  public label = 'Дата';

  @Input()
  public dateValue: Date | null = new Date(2024, 5, 15);

  @Input()
  public min = '';

  @Input()
  public max = '';
}

const meta: Meta<NativeDateDemoComponent> = {
  title: 'NativeDate',
  component: NativeDateDemoComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<NativeDateDemoComponent>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => ({
    template: `
      <label class="flex flex-col gap-2 max-w-xs">
        <span>Дата (пусто)</span>
        <input type="date" nativeDate [ngModel]="null" />
      </label>
    `,
    moduleMetadata: {
      imports: [NativeDateValueAccessorDirective, FormsModule],
    },
  }),
};

export const MinMax: Story = {
  args: {
    label: 'Дата (мин/макс)',
    dateValue: new Date(2026, 6, 15),
    min: formatDate(new Date(2026, 6, 1), YYYY_MM_DD, 'ru-RU'),
    max: formatDate(new Date(2026, 6, 31), YYYY_MM_DD, 'ru-RU'),
  },
};
