import type {
  OnInit} from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClrSelectedState, ClrTreeViewModule } from '@clr/angular';
import type { Debtor, Project } from '@sotbi/models';
import { FilterBlockComponent } from '../filter-block';
import { FilterComponent } from '../filter-search';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'project-debtor-tree',
  templateUrl: './project-debtor-tree.component.html',
  styleUrls: ['./project-debtor-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterBlockComponent, FilterComponent, ClrTreeViewModule],
})
export class ProjectDebtorTreeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public readonly all = input<number | undefined>(undefined);
  public readonly checkedItems = input<Project[]>([]);
  public readonly selected = output<Partial<Project>[]>();

  protected readonly selectedItems = signal<number>(0);
  protected readonly checked = signal<boolean>(false);

  private readonly searchTextChanged = new Subject<string>();
  private allProjects: Project[] = [];
  private _projects: Project[] = [];
  private result: Partial<Project>[] = [];

  @Input() public set projects(projects: Project[]) {
    this.allProjects = projects;
    this._projects = projects;
    // для выставления уже выбранных после триггера SetSubordinatesFilter, который триггерит getProjects в SubordinatesCostsState
    if (this.result?.length > 0) {
      this.markSelected(this.result, this._projects);
    }
  }
  public get projects(): Project[] {
    return this._projects;
  }

  private search(phrase: string): void {
    if (phrase.length === 0) {
      this._projects = structuredClone(this.allProjects);
      return;
    }
    phrase = phrase.toLowerCase();
    const reducer = (res: Project[], item: Project) => {
      if (item.name.toLowerCase().includes(phrase)) {
        if ((item.debtors?.length ?? 0) > 0) {
          this.filterDebtors(phrase, item);
        }
        res.push(item);
      } else {
        if ((item.debtors?.length ?? 0) > 0) {
          this.filterDebtors(phrase, item);
          if (item?.debtors?.length) {
            res?.push(item);
          }
        }
      }
      return res;
    };
    this._projects = structuredClone(this.allProjects).reduce(reducer, []);
  }

  private filterDebtors(phrase: string, item: Project): Debtor[] | undefined {
    return (item.debtors = item?.debtors?.filter((debtor) =>
      debtor?.name?.toLowerCase()?.includes(phrase),
    ));
  }

  private markSelected(src: Partial<Project>[], dst: Partial<Project>[]): void {
    let length = 0;
    for (const project of src) {
      const item = dst?.find((el) => el.id === project.id);
      if (!item) {
        continue;
      }
      item.selected = project.selected;
      if ((project.debtors?.length ?? 0) > 0) {
        length++;
        for (const debtor of project.debtors ?? []) {
          const idx = item.debtors?.findIndex((d) => d.id === debtor.id) ?? -1;
          if (idx >= 0) {
            item.debtors![idx].selected = debtor.selected;
          }
        }
      }
      this.selectedItems.set(src.length + length);
    }
  }

  public ngOnInit(): void {
    this.searchTextChanged
      .pipe(debounceTime(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((phrase) => this.search(phrase));
    if (this.checkedItems().length > 0) {
      this.markSelected(this.checkedItems(), this._projects);
    }
  }

  public setSelectedItems(numbers: number[]): void {
    let count = 0;
    this.projects?.forEach((project) => {
      if (numbers?.includes(project?.id)) {
        project.selected = true;
        count += 1;
        if ((project.debtors?.length ?? 0) > 0) {
          project.debtors!.forEach((debtor) => {
            debtor.selected = true;
            count += 1;
          });
        }
      } else {
        project.selected = false;
        if ((project?.debtors?.length ?? 0) > 0) {
          project.debtors!.forEach((debtor) => {
            if (numbers?.includes(debtor?.id)) {
              debtor.selected = true;
              count += 1;
            } else {
              debtor.selected = false;
            }
          });
        }
      }
    });
    this.selectedItems.set(count);
  }

  protected toClrState(value: Project['selected'] | Debtor['selected']): ClrSelectedState {
    if (value === 'indeterminate') {
      return ClrSelectedState.INDETERMINATE;
    }
    return value === true ? ClrSelectedState.SELECTED : ClrSelectedState.UNSELECTED;
  }

  protected fromClrState(value: ClrSelectedState | null): boolean | 'indeterminate' {
    return value === ClrSelectedState.INDETERMINATE
      ? 'indeterminate'
      : value === ClrSelectedState.SELECTED;
  }

  protected toggleSelectAll(checked: boolean): void {
    this.clearSelected();
    for (const project of this.projects) {
      if (project.selected !== 'indeterminate') {
        project.selected = true;
      }
      (project.debtors ?? []).map((el) => (el.selected = true));
    }
    this.checked.set(false);
    if (!checked) {
      this.checked.set(true);
    } else {
      this.clearSelected();
    }
    this.onChange();
  }

  protected onKeyUp(phrase: string): void {
    this.checked.set(false);
    this.searchTextChanged.next(phrase);
  }

  protected onChange(): void {
    this.markSelected(this._projects, this.allProjects);
    this.selectedItems.set(0);
    const reducer = (res: Partial<Project>[], item: Project) => {
      if (item.selected) {
        this.selectedItems.update((prev) => prev + 1);
        item.debtors = item.debtors?.filter((debtor) => debtor.selected);
        res.push(item);
        this.selectedItems.update((prev) => prev + (item.debtors?.length ?? 0));
      }
      return res;
    };
    this.result = structuredClone(this.allProjects).reduce(reducer, []);
    this.selected.emit(this.result);
  }

  protected clearSelected(): void {
    for (const project of this.projects) {
      project.selected = false;
      (project.debtors ?? []).map((el) => (el.selected = false));
    }
    for (const project of this.allProjects) {
      project.selected = false;
      (project.debtors ?? []).map((el) => (el.selected = false));
    }
    this.checked.set(false);
    this.onChange();
  }
}
