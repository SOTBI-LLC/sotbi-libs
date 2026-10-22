import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ClrIcon } from '@clr/angular';
import * as clarityShapes from '@clr/angular/icon';
import { ClarityIcons } from '@clr/angular/icon';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';
import {
  LucideArchive,
  LucideBook,
  LucideBriefcase,
  LucideBug,
  LucideCalculator,
  LucideCalendar,
  LucideCalendarCheck,
  LucideChartColumn,
  LucideCheck,
  LucideChevronUp,
  LucideCircle,
  LucideChevronsUp,
  LucideCircleAlert,
  LucideCircleCheck,
  LucideCircleMinus,
  LucideCircleQuestionMark,
  LucideCircleX,
  LucideClipboard,
  LucideClock,
  LucideCloudDownload,
  LucideCloudUpload,
  LucideCopy,
  LucideCrown,
  LucideDownload,
  LucideEraser,
  LucideExternalLink,
  LucideEye,
  LucideEyeOff,
  LucideFaceSlightlyFrowning,
  LucideFactory,
  LucideFile,
  LucideFileBadge,
  LucideFileSymlink,
  LucideFileText,
  LucideFolder,
  LucideGauge,
  LucideGavel,
  LucideGrid3x3,
  LucideGripVertical,
  LucideHammer,
  LucideHandCoins,
  LucideHourglass,
  LucideHouse,
  LucideInfo,
  LucideKey,
  LucideLandmark,
  LucideLayoutGrid,
  LucideList,
  LucideListOrdered,
  LucideLogIn,
  LucideMail,
  LucideMap,
  LucideMapPin,
  LucideMessagesSquare,
  LucideMinimize2,
  LucideMinus,
  LucideNetwork,
  LucidePanelRightOpen,
  LucidePencil,
  LucidePlus,
  LucidePrinter,
  LucideReceipt,
  LucideRefreshCw,
  LucideSave,
  LucideScroll,
  LucideShield,
  LucideStar,
  LucideStickyNote,
  LucideTable,
  LucideTarget,
  LucideTrash,
  LucideTriangleAlert,
  LucideUndo2,
  LucideUpload,
  LucideUser,
  LucideUsers,
  LucideUsersRound,
  LucideVideo,
  LucideWallet,
  LucideWrench,
  LucideX,
  LucideZap,
} from '@lucide/angular';
import type { Meta, StoryObj } from '@storybook/angular';

/**
 * Clarity shape → Lucide replacement accepted in the B38 catalog (BH-1896).
 * Temporary migration data: removed together with @clr/angular.
 */
const CLARITY_TO_LUCIDE: Readonly<Record<string, LucideIconData>> = {
  add: LucidePlus.icon,
  angle: LucideChevronUp.icon,
  'angle-double': LucideChevronsUp.icon,
  archive: LucideArchive.icon,
  bank: LucideLandmark.icon,
  'bar-chart': LucideChartColumn.icon,
  bolt: LucideZap.icon,
  book: LucideBook.icon,
  briefcase: LucideBriefcase.icon,
  bug: LucideBug.icon,
  'bullet-list': LucideList.icon,
  calculator: LucideCalculator.icon,
  calendar: LucideCalendar.icon,
  certificate: LucideFileBadge.icon,
  check: LucideCheck.icon,
  circle: LucideCircle.icon,
  clipboard: LucideClipboard.icon,
  clock: LucideClock.icon,
  close: LucideX.icon,
  'coin-bag': LucideHandCoins.icon,
  copy: LucideCopy.icon,
  crown: LucideCrown.icon,
  dashboard: LucideGauge.icon,
  'detail-expand': LucidePanelRightOpen.icon,
  details: LucideFileText.icon,
  download: LucideDownload.icon,
  'download-cloud': LucideCloudDownload.icon,
  'drag-handle': LucideGripVertical.icon,
  'e-check': LucideReceipt.icon,
  'employee-group': LucideUsersRound.icon,
  envelope: LucideMail.icon,
  eraser: LucideEraser.icon,
  'error-standard': LucideCircleAlert.icon,
  event: LucideCalendarCheck.icon,
  'exclamation-circle': LucideCircleAlert.icon,
  'exclamation-triangle': LucideTriangleAlert.icon,
  eye: LucideEye.icon,
  'eye-hide': LucideEyeOff.icon,
  factory: LucideFactory.icon,
  file: LucideFile.icon,
  'file-share-2': LucideFileSymlink.icon,
  floppy: LucideSave.icon,
  folder: LucideFolder.icon,
  gavel: LucideGavel.icon,
  'grid-view': LucideGrid3x3.icon,
  help: LucideCircleQuestionMark.icon,
  'help-info': LucideInfo.icon,
  home: LucideHouse.icon,
  hourglass: LucideHourglass.icon,
  'info-circle': LucideInfo.icon,
  'info-standard': LucideInfo.icon,
  key: LucideKey.icon,
  list: LucideList.icon,
  login: LucideLogIn.icon,
  map: LucideMap.icon,
  'map-marker': LucideMapPin.icon,
  'minus-circle': LucideCircleMinus.icon,
  note: LucideStickyNote.icon,
  'number-list': LucideListOrdered.icon,
  organization: LucideNetwork.icon,
  pencil: LucidePencil.icon,
  plus: LucidePlus.icon,
  'pop-out': LucideExternalLink.icon,
  printer: LucidePrinter.icon,
  refresh: LucideRefreshCw.icon,
  'sad-face': LucideFaceSlightlyFrowning.icon,
  scroll: LucideScroll.icon,
  shield: LucideShield.icon,
  star: LucideStar.icon,
  'success-standard': LucideCircleCheck.icon,
  table: LucideTable.icon,
  'talk-bubbles': LucideMessagesSquare.icon,
  target: LucideTarget.icon,
  times: LucideX.icon,
  'times-circle': LucideCircleX.icon,
  tools: LucideHammer.icon,
  trash: LucideTrash.icon,
  undo: LucideUndo2.icon,
  upload: LucideUpload.icon,
  'upload-cloud': LucideCloudUpload.icon,
  user: LucideUser.icon,
  users: LucideUsers.icon,
  'video-camera': LucideVideo.icon,
  'view-cards': LucideLayoutGrid.icon,
  'view-list': LucideList.icon,
  wallet: LucideWallet.icon,
  'warning-standard': LucideTriangleAlert.icon,
  'window-close': LucideX.icon,
  'window-min': LucideMinus.icon,
  'window-restore': LucideMinimize2.icon,
  wrench: LucideWrench.icon,
};

type ShapeTuple = Parameters<typeof ClarityIcons.addIcons>[number];
const isShapeTuple = (value: unknown): value is ShapeTuple =>
  Array.isArray(value) && value.length === 2 && typeof value[0] === 'string';
ClarityIcons.addIcons(...Object.values(clarityShapes).filter(isShapeTuple));

const SHAPES = Object.keys(CLARITY_TO_LUCIDE);

const contexts = (icon: string): string => `
  <div class="icon-row"><span>default</span>${icon}</div>
  <div class="icon-row"><span>size sm/lg/24</span>${icon.replace('/>', ' ATTR_SIZE="sm" />')}${icon.replace('/>', ' ATTR_SIZE="lg" />')}${icon.replace('/>', ' ATTR_SIZE="24" />')}</div>
  <div class="icon-row"><span>direction</span>${['right', 'down', 'left'].map((d) => icon.replace('/>', ` ATTR_DIRECTION="${d}" />`)).join('')}</div>
  <div class="icon-row"><span>status</span>${['success', 'danger', 'warning', 'info'].map((s) => icon.replace('/>', ` ATTR_STATUS="${s}" />`)).join('')}</div>
  <div class="icon-row"><span>.btn</span>
    <button type="button" class="btn btn-sm btn-outline">${icon} Кнопка</button>
    <button type="button" class="btn btn-sm btn-primary btn-icon" aria-label="Кнопка">${icon}</button>
  </div>
  <div class="icon-row"><span>.close</span><button type="button" class="close" aria-label="Закрыть">${icon}</button></div>
  <div class="icon-row"><span>.alert</span>
    <div class="alert alert-danger alert-sm" role="alert"><div class="alert-items"><div class="alert-item static">
      <div class="alert-icon-wrapper">${icon.replace('/>', ' class="alert-icon" />')}</div>
      <span class="alert-text">Текст уведомления</span>
    </div></div>
    <button type="button" class="close" aria-label="Закрыть">${icon}</button></div>
  </div>
  <div class="icon-row"><span>.clr-validate-icon</span>${icon.replace('/>', ' class="clr-validate-icon" />')}</div>
`;

const STYLES = `
  .icon-row { display: flex; align-items: center; gap: 8px; min-height: 32px; }
  .icon-row > span { width: 132px; color: #666; font-size: 12px; }
  .alert { flex: 1; margin: 0; }
`;

@Component({
  selector: 'sotbi-clarity-icon-sample',
  imports: [ClrIcon],
  template: contexts('<cds-icon [shape]="shape()" />')
    .replace(/ATTR_SIZE/g, 'size')
    .replace(/ATTR_DIRECTION/g, 'direction')
    .replace(/ATTR_STATUS/g, 'status'),
  styles: STYLES,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ClaritySampleComponent {
  public readonly shape = input.required<string>();
}

@Component({
  selector: 'sotbi-lucide-icon-sample',
  imports: [LucideDynamicIcon],
  template: contexts('<svg [lucideIcon]="icon()" />')
    .replace(/<svg ([^>]*?)\s*\/>/g, '<svg $1></svg>')
    .replace(/ATTR_SIZE/g, 'data-size')
    .replace(/ATTR_DIRECTION/g, 'data-direction')
    .replace(/ATTR_STATUS/g, 'data-status'),
  styles: STYLES,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LucideSampleComponent {
  public readonly shape = input.required<string>();
  protected icon(): LucideIconData {
    return CLARITY_TO_LUCIDE[this.shape()];
  }
}

@Component({
  selector: 'sotbi-icon-catalog',
  imports: [ClrIcon, LucideDynamicIcon],
  template: `<table class="table table-compact catalog">
    <thead>
      <tr>
        <th>Clarity shape</th>
        <th>Clarity</th>
        <th>Lucide</th>
        <th>Lucide class</th>
      </tr>
    </thead>
    <tbody>
      @for (row of rows; track row.shape) {
        <tr>
          <td>
            <code>{{ row.shape }}</code>
          </td>
          <td><cds-icon [shape]="row.shape" size="md" /></td>
          <td><svg [lucideIcon]="row.icon" data-size="md"></svg></td>
          <td>
            <code>{{ row.icon.name }}</code>
          </td>
        </tr>
      }
    </tbody>
  </table>`,
  styles: `
    .catalog {
      width: auto;
      margin: 0;
    }
    .catalog td {
      vertical-align: middle;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IconCatalogComponent {
  protected readonly rows = SHAPES.map((shape) => ({
    shape,
    icon: CLARITY_TO_LUCIDE[shape],
  }));
}

// Temporary migration catalog (BH-1896, B40): Clarity column and table go away
// together with @clr/angular.
const meta: Meta = {
  title: 'Icon',
  tags: ['autodocs'],
};

export default meta;

/** Every Clarity shape used by the consumers next to its Lucide replacement. */
export const Catalog: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: [IconCatalogComponent] },
    template: `<sotbi-icon-catalog />`,
  }),
};

/** Sizes, directions, statuses and @clr/ui contexts: cds-icon vs svg.lucide. */
export const Contexts: StoryObj<{ shape: string }> = {
  args: { shape: 'times' },
  argTypes: { shape: { control: 'select', options: SHAPES } },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [ClaritySampleComponent, LucideSampleComponent],
    },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px">
      <section><h4>Clarity</h4><sotbi-clarity-icon-sample [shape]="shape" /></section>
      <section><h4>Lucide</h4><sotbi-lucide-icon-sample [shape]="shape" /></section>
    </div>`,
  }),
};
