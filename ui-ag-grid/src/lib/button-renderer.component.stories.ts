import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import type { ICellRendererParams } from 'ag-grid-community';

import { ButtonRendererComponent } from './button-renderer.component';

@Component({
  selector: 'lib-button-renderer-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container #host />`,
})
class ButtonRendererStoryHost implements AfterViewInit {
  @Input()
  public dataId = 'row-1';

  @Input()
  public nodeId = 1;

  @ViewChild('host', { read: ViewContainerRef })
  private host!: ViewContainerRef;

  public ngAfterViewInit(): void {
    const ref = this.host.createComponent(ButtonRendererComponent);
    ref.instance.agInit({
      node: { id: String(this.nodeId), data: { id: this.dataId } },
      onClick: (dataId?: string, nodeId?: number) => {
        // eslint-disable-next-line no-console
        console.log('delete clicked', { dataId, nodeId });
      },
    } as ICellRendererParams & {
      onClick: (dataId?: string, nodeId?: number) => void;
    });
    ref.changeDetectorRef.detectChanges();
  }
}

const meta: Meta<ButtonRendererStoryHost> = {
  title: 'ButtonRenderer',
  component: ButtonRendererStoryHost,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ButtonRendererStoryHost>;

export const Default: Story = {};
