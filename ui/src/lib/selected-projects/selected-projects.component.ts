import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Project } from '@sotbi/models';

import { FilterBlockComponent } from '../filter-block';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'selected-projects',
  imports: [ClarityModule, FilterBlockComponent],
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
            <clr-tree class="tree list">
              <clr-tree-node [clrExpanded]="true">
                <clr-icon shape="star" class="is-warning"></clr-icon>
                {{ project.name }}
                @for (debtor of project.debtors; track debtor) {
                  <clr-tree-node>
                    <clr-icon shape="star" class="is-warning"></clr-icon>
                    {{ debtor.name }}
                  </clr-tree-node>
                }
              </clr-tree-node>
            </clr-tree>
          }
        </span>
      } @else {
        <div class="helper">
          <div>Добавьте проекты в "Избранное" с помощью кнопки "Выбрать"</div>
        </div>
      }
      <ng-template #helper>
        <div class="helper">
          <div>Добавьте проекты в "Избранное" с помощью кнопки "Выбрать"</div>
        </div>
      </ng-template>
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
