import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';

import { NativeTimeValueAccessorDirective } from './native-time.directive';

@Component({
  standalone: true,
  imports: [NativeTimeValueAccessorDirective, FormsModule],
  template: `
    <label class="flex flex-col gap-2 max-w-xs">
      <span>Время</span>
      <input type="time" nativeTime [(ngModel)]="timeValue" />
    </label>
    <p class="mt-2 text-sm text-gray-600">
      Модель (минуты): {{ timeValue ?? '—' }}
    </p>
  `,
})
class NativeTimeDemoComponent {
  public timeValue: number | null = 23 * 60 + 59;
}

const meta: Meta<NativeTimeDemoComponent> = {
  title: 'NativeTime',
  component: NativeTimeDemoComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<NativeTimeDemoComponent>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => ({
    template: `
      <label class="flex flex-col gap-2 max-w-xs">
        <span>Время (пусто)</span>
        <input type="time" nativeTime [ngModel]="null" />
      </label>
    `,
    moduleMetadata: {
      imports: [NativeTimeValueAccessorDirective, FormsModule],
    },
  }),
};
