import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Debtor, Project } from '@sotbi/models';
import { FilterBlockComponent } from '../filter-block';
import { FilterComponent } from '../filter-search';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LucideChevronUp } from '@lucide/angular';

@Component({
  selector: 'project-debtor-tree',
  templateUrl: './project-debtor-tree.component.html',
  styleUrls: ['./project-debtor-tree.component.scss', '../tree-native.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterBlockComponent,
    FilterComponent,
    LucideChevronUp,
    Tree,
    TreeItem,
    TreeItemGroup,
  ],
})
export class ProjectDebtorTreeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
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
    this.reconcileSelection();
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
    // Clarity derived the parent's state from the rendered children after filtering.
    for (const item of this._projects) {
      const children = item.debtors ?? [];
      if (!children.length) continue;
      item.selected = children.every((child) => child.selected === true)
        ? true
        : children.some((child) => !!child.selected)
          ? 'indeterminate'
          : false;
    }
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
      .subscribe((phrase) => {
        this.search(phrase);
        this.cdr.markForCheck();
      });
    if (this.checkedItems().length > 0) {
      this.markSelected(this.checkedItems(), this._projects);
      this.reconcileSelection();
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
    this.reconcileSelection();
    this.markSelected(this._projects, this.allProjects);
    this.selectedItems.set(count);
    this.cdr.markForCheck();
  }

  private reconcileSelection(): void {
    for (const item of this._projects) {
      const children = item.debtors ?? [];
      if (!children.length) continue;
      if (item.selected === true) {
        for (const child of children) child.selected = true;
      } else {
        item.selected = children.every((child) => child.selected === true)
          ? true
          : children.some((child) => !!child.selected)
            ? 'indeterminate'
            : false;
      }
    }
  }

  protected selectParent(parent: Project, selected: boolean): void {
    parent.selected = selected;
    for (const child of parent.debtors ?? []) child.selected = selected;
    this.onChange();
  }
  protected selectChild(
    parent: Project,
    child: Debtor,
    selected: boolean,
  ): void {
    child.selected = selected;
    const children = parent.debtors ?? [];
    parent.selected = children.every((item) => item.selected === true)
      ? true
      : children.some((item) => !!item.selected)
        ? 'indeterminate'
        : false;
    this.onChange();
  }
  protected selectionKey(event: Event, parent: Project, child?: Debtor): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    if (child) this.selectChild(parent, child, child.selected !== true);
    else this.selectParent(parent, parent.selected !== true);
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
