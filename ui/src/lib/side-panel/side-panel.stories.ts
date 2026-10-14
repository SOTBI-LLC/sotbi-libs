import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  applicationConfig,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { SidePanelFrameComponent } from './side-panel-frame';
import type { SidePanelSize } from './side-panel-config';

@Component({
  selector: 'sotbi-panel-example',
  imports: [SidePanelFrameComponent, FormsModule],
  template: `
    <button type="button" class="btn btn-primary" (click)="opened.set(true)">
      Открыть панель
    </button>
    @if (opened()) {
      <sotbi-side-panel
        #panel
        [size]="size()"
        [dirty]="!readOnly() && name() !== 'Проект'"
        [blocked]="saving()"
        (cancelled)="opened.set(false)"
      >
        <h3 panelTitle>
          {{ readOnly() ? 'Просмотр проекта' : 'Изменить проект' }}
        </h3>
        <div panelBody>
          @if (error()) {
            <div class="alert alert-danger" role="alert">{{ error() }}</div>
          }
          @if (readOnly()) {
            <p>{{ name() }}</p>
          } @else {
            <label for="panel-project-name">Название</label>
            <input
              id="panel-project-name"
              class="clr-input"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              [disabled]="saving()"
            />
          }
          @if (longContent()) {
            @for (row of rows; track row) {
              <p>Параметры проекта {{ row }}</p>
            }
          }
          @if (saving()) {
            <p role="status">Сохраняем…</p>
          }
        </div>
        <div panelActions>
          <button
            type="button"
            class="btn btn-outline"
            [disabled]="saving()"
            (click)="panel.requestClose()"
          >
            Отмена
          </button>
          @if (!readOnly()) {
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="saving()"
              (click)="save()"
            >
              Сохранить
            </button>
          }
        </div>
      </sotbi-side-panel>
    }
  `,
})
class PanelExampleComponent {
  public readonly longContent = input(false);
  protected readonly rows = Array.from({ length: 50 }, (_, index) => index + 1);
  public readonly size = input<SidePanelSize>('md');
  public readonly readOnly = input(false);
  public readonly failSave = input(false);
  public readonly opened = signal(true);
  public readonly name = signal('Проект');
  public readonly saving = signal(false);
  public readonly error = signal('');

  public save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    setTimeout(() => {
      this.saving.set(false);
      if (this.failSave())
        this.error.set('Не удалось сохранить проект. Попробуйте ещё раз.');
      else this.opened.set(false);
    }, 1500);
  }
}

const meta: Meta<PanelExampleComponent> = {
  component: PanelExampleComponent,
  title: 'Side Panel/Interaction',
  decorators: [applicationConfig({ providers: [provideAnimations()] })],
  args: { size: 'md', readOnly: false, failSave: false },
};
export default meta;
type Story = StoryObj<PanelExampleComponent>;
export const Form: Story = {};
export const SaveError: Story = { args: { failSave: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const FullScreen: Story = { args: { size: 'full-screen' } };

export const LongContent: Story = { args: { longContent: true } };
