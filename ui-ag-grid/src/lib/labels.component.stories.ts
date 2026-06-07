import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import type { ICellRendererParams } from 'ag-grid-community';

import { LabelsAgGridComponent } from './labels.component';

@Component({
  selector: 'lib-labels-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container #host />`,
})
class LabelsStoryHost implements AfterViewInit {
  @Input({ required: true })
  public labels!: string[];

  @ViewChild('host', { read: ViewContainerRef })
  private host!: ViewContainerRef;

  public ngAfterViewInit(): void {
    const ref = this.host.createComponent(LabelsAgGridComponent);
    ref.instance.agInit({
      value: this.labels,
    } as ICellRendererParams);
    ref.changeDetectorRef.detectChanges();
  }
}

const meta: Meta<LabelsStoryHost> = {
  title: 'LabelsAgGrid',
  component: LabelsStoryHost,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<LabelsStoryHost>;

export const Default: Story = {
  args: {
    labels: ['Активный', 'Срочный', 'Новый'],
  },
};
