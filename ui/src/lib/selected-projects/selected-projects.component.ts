import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Project } from '@sotbi/models';

import { FilterBlockComponent } from '../filter-block';
import { LucideChevronUp, LucideStar } from '@lucide/angular';

@Component({
  selector: 'selected-projects',
  imports: [
    LucideChevronUp,
    LucideStar,
    Tree,
    TreeItem,
    TreeItemGroup,
    FilterBlockComponent,
  ],
  styleUrls: ['../tree-native.scss'],
  template: `
    <filter-block
      title="Избранные проекты"
      selectedText="{{ all() }}"
      (clear)="selectFavorites()"
      clearText="Выбрать"
    >
      @if (projects().length > 0) {
        <span>
          @for (project of projects(); track project.id) {
            <div
              ngTree
              #tree="ngTree"
              class="tree list"
              focusMode="roving"
              [attr.aria-label]="project.name"
            >
              <div
                ngTreeItem
                #node="ngTreeItem"
                [parent]="tree"
                [value]="project.id"
                [label]="project.name"
                [selectable]="false"
                [expanded]="true"
                [preserveContent]="true"
                class="clr-tree-node"
              >
                <div class="clr-tree-node-content-container">
                  @if (project.debtors?.length) {
                    <button
                      type="button"
                      class="clr-treenode-caret"
                      tabindex="-1"
                      aria-hidden="true"
                      (click)="
                        node.element.focus();
                        node.expanded.set(!node.expanded());
                        $event.stopPropagation()
                      "
                    >
                      <svg
                        lucideChevronUp
                        class="clr-treenode-caret-icon"
                        [attr.data-direction]="
                          node.expanded() ? 'down' : 'right'
                        "
                      ></svg>
                    </button>
                  }
                  <div class="clr-treenode-content">
                    <svg lucideStar class="is-warning"></svg>{{ project.name }}
                  </div>
                </div>
                @if (project.debtors?.length) {
                  <div
                    role="group"
                    class="clr-treenode-children"
                    [hidden]="!node.expanded()"
                    [attr.inert]="node.expanded() ? null : ''"
                  >
                    <ng-template
                      ngTreeItemGroup
                      [ownedBy]="node"
                      #group="ngTreeItemGroup"
                    >
                      @for (debtor of project.debtors; track debtor.id) {
                        <div
                          ngTreeItem
                          [parent]="group"
                          [value]="debtor.id"
                          [label]="debtor.name"
                          [selectable]="false"
                          class="clr-tree-node"
                        >
                          <div class="clr-tree-node-content-container">
                            <div class="clr-treenode-content">
                              <svg lucideStar class="is-warning"></svg
                              >{{ debtor.name }}
                            </div>
                          </div>
                        </div>
                      }
                    </ng-template>
                  </div>
                }
              </div>
            </div>
          }
        </span>
      } @else {
        <div class="helper">
          <div>Добавьте проекты в "Избранное" с помощью кнопки "Выбрать"</div>
        </div>
      }
    </filter-block>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .helper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedProjectsComponent {
  public readonly all = input('0');
  public readonly projects = input<Partial<Project>[]>([]);
  public readonly selectFav = output<void>();

  public selectFavorites(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.selectFav.emit();
  }
}
