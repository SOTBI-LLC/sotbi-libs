import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import type { GridApi, IStatusPanelParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';

import type { MoneySumStatusPanelParams } from './money-sum-status-bar.component';
import { MoneySumStatusBarComponent } from './money-sum-status-bar.component';

interface Row {
  amount: number;
}

@Component({
  selector: 'lib-money-sum-status-bar-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ag-theme-alpine ag-status-bar">
    <ng-container #host />
  </div>`,
})
class MoneySumStatusBarStoryHost implements AfterViewInit, OnDestroy {
  @Input()
  public amounts: number[] = [];

  @Input()
  public label = 'ИТОГО';

  @Input()
  public colorBySign = false;

  @Input()
  public digitsInfo?: string;

  @ViewChild('host', { read: ViewContainerRef })
  private host!: ViewContainerRef;

  private api: GridApi<Row> | null = null;

  public ngAfterViewInit(): void {
    this.api = createGrid<Row>(document.createElement('div'), {
      columnDefs: [{ field: 'amount' }],
      rowData: this.amounts.map((amount) => ({ amount })),
    });
    const ref = this.host.createComponent(MoneySumStatusBarComponent<Row>);
    ref.instance.agInit({
      api: this.api,
      label: this.label,
      sum: (rows: Row[]) => rows.reduce((acc, { amount }) => acc + amount, 0),
      colorBySign: this.colorBySign,
      digitsInfo: this.digitsInfo,
    } as IStatusPanelParams<Row> & MoneySumStatusPanelParams<Row>);
    ref.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    this.api?.destroy();
  }
}

const meta: Meta<MoneySumStatusBarStoryHost> = {
  title: 'StatusBar/MoneySum',
  component: MoneySumStatusBarStoryHost,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MoneySumStatusBarStoryHost>;

export const Negative: Story = {
  args: { amounts: [-1000, 300], colorBySign: true },
};

export const Positive: Story = {
  args: { amounts: [1200.5, 300], colorBySign: true },
};

export const Zero: Story = {
  args: { amounts: [], colorBySign: true },
};

export const WithoutColouring: Story = {
  args: { amounts: [-1000, 300], label: 'Итого', digitsInfo: '0.2-2' },
};
