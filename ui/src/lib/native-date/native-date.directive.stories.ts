import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';

import { NativeDateValueAccessorDirective } from './native-date.directive';

@Component({
  standalone: true,
  imports: [NativeDateValueAccessorDirective, FormsModule, DatePipe],
  template: `
    <label class="flex flex-col gap-2 max-w-xs">
      <span>Дата</span>
      <input type="date" nativeDate [(ngModel)]="dateValue" />
    </label>
    <p class="mt-2 text-sm text-gray-600">
      Модель: {{ dateValue ? (dateValue | date: 'mediumDate') : '—' }}
    </p>
  `,
})
class NativeDateDemoComponent {
  public dateValue: Date | null = new Date(2024, 5, 15);
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
