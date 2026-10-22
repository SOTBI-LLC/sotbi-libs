import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideChevronUp,
  LucideCircleAlert,
  LucideCloudUpload,
  LucideDynamicIcon,
  LucidePencil,
  LucideStar,
  LucideTrash,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';
import type { Meta, StoryObj } from '@storybook/angular';

const ICONS: Readonly<Record<string, LucideIconData>> = {
  x: LucideX.icon,
  'chevron-up': LucideChevronUp.icon,
  'circle-alert': LucideCircleAlert.icon,
  pencil: LucidePencil.icon,
  trash: LucideTrash.icon,
  'cloud-upload': LucideCloudUpload.icon,
  star: LucideStar.icon,
};

/** `svg.lucide` in the @clr/ui contexts covered by ui/src/lucide-icons.css. */
@Component({
  selector: 'sotbi-lucide-icon-contexts',
  imports: [LucideDynamicIcon],
  template: `
    <div class="icon-row">
      <span>default</span><svg [lucideIcon]="icon()"></svg>
    </div>
    <div class="icon-row">
      <span>data-size sm/lg/24</span>
      <svg [lucideIcon]="icon()" data-size="sm"></svg>
      <svg [lucideIcon]="icon()" data-size="lg"></svg>
      <svg [lucideIcon]="icon()" data-size="24"></svg>
    </div>
    <div class="icon-row">
      <span>data-direction</span>
      <svg [lucideIcon]="icon()" data-direction="right"></svg>
      <svg [lucideIcon]="icon()" data-direction="down"></svg>
      <svg [lucideIcon]="icon()" data-direction="left"></svg>
    </div>
    <div class="icon-row">
      <span>data-status</span>
      <svg [lucideIcon]="icon()" data-status="success"></svg>
      <svg [lucideIcon]="icon()" data-status="danger"></svg>
      <svg [lucideIcon]="icon()" data-status="warning"></svg>
      <svg [lucideIcon]="icon()" data-status="info"></svg>
    </div>
    <div class="icon-row">
      <span>.btn</span>
      <button type="button" class="btn btn-sm btn-outline">
        <svg [lucideIcon]="icon()"></svg> Кнопка
      </button>
      <button
        type="button"
        class="btn btn-sm btn-primary btn-icon"
        aria-label="Кнопка"
      >
        <svg [lucideIcon]="icon()"></svg>
      </button>
    </div>
    <div class="icon-row">
      <span>.close</span>
      <button type="button" class="close" aria-label="Закрыть">
        <svg [lucideIcon]="icon()"></svg>
      </button>
    </div>
    <div class="icon-row">
      <span>.alert</span>
      <div class="alert alert-danger alert-sm" role="alert">
        <div class="alert-items">
          <div class="alert-item static">
            <div class="alert-icon-wrapper">
              <svg class="alert-icon" [lucideIcon]="icon()"></svg>
            </div>
            <span class="alert-text">Текст уведомления</span>
          </div>
        </div>
        <button type="button" class="close" aria-label="Закрыть">
          <svg [lucideIcon]="icon()"></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .icon-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
    }
    .icon-row > span {
      width: 132px;
      color: #666;
      font-size: 12px;
    }
    .alert {
      flex: 1;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LucideIconContextsComponent {
  public readonly icon = input.required<LucideIconData>();
}

const meta: Meta<{ icon: string }> = {
  title: 'Icon',
  tags: ['autodocs'],
};

export default meta;

/** Sizes, directions, statuses and @clr/ui contexts of Lucide SVGs. */
export const Contexts: StoryObj<{ icon: string }> = {
  args: { icon: 'x' },
  argTypes: { icon: { control: 'select', options: Object.keys(ICONS) } },
  render: ({ icon }) => ({
    props: { data: ICONS[icon] },
    moduleMetadata: { imports: [LucideIconContextsComponent] },
    template: `<sotbi-lucide-icon-contexts [icon]="data" />`,
  }),
};
