import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import type { Project } from '@sotbi/models';

import { ProjectDebtorTreeComponent } from './project-debtor-tree.component';

const project = (name: string, debtors: string[], id = name.length): Project =>
  ({
    id,
    name,
    selected: false,
    debtors: debtors.map((d, i) => ({ id: id * 10 + i, name: d, selected: false })),
  }) as unknown as Project;

@Component({
  imports: [ProjectDebtorTreeComponent],
  template: `
    <project-debtor-tree
      [all]="all()"
      [checkedItems]="checkedItems()"
      [projects]="projects"
      (selected)="selected.set($event)"
    />
    <button type="button" (click)="noop()">tick</button>
  `,
})
class HostComponent {
  public readonly all = signal(4);
  public readonly checkedItems = signal<Project[]>([]);
  public projects: Project[] = [
    project('Стройка', ['ООО Рога', 'ООО Копыта'], 1),
    project('Ремонт', ['ИП Иванов'], 2),
  ];
  public readonly selected = signal<Partial<Project>[] | null>(null);
  public noop(): void {
    /* event only: triggers a change detection cycle */
  }
}

describe('ProjectDebtorTree', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const createHost = async (setup: (host: HostComponent) => void = () => undefined): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    setup(host);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const tick = async () => {
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
  };

  const treeText = () => (fixture.nativeElement as HTMLElement).textContent!;

  const setSearch = async (phrase: string) => {
    const input = fixture.nativeElement.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.value = phrase;
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 600));
    await tick();
  };

  it('creates and renders projects with debtors and the counter', async () => {
    await createHost();

    const text = treeText();
    expect(text).toContain('Проекты и должники');
    expect(text).toContain('Стройка');
    expect(text).toContain('ООО Рога');
    expect(text).toContain('Ремонт');
    expect(text).toContain('ИП Иванов');
    expect(text).toContain('0/4');
  });

  it('marks items passed in checkedItems and counts them', async () => {
    const pre = project('Стройка', ['ООО Рога'], 1);
    (pre as unknown as { selected: boolean }).selected = true;
    await createHost((h) => h.checkedItems.set([pre]));

    expect(treeText()).toContain('2/4');
  });

  it('filters the tree by the debounced search phrase', async () => {
    await createHost();

    await setSearch('иван');

    const text = treeText();
    expect(text).toContain('Ремонт');
    expect(text).toContain('ИП Иванов');
    expect(text).not.toContain('Стройка');
  });

  it('restores the full tree when the search phrase is cleared', async () => {
    await createHost();
    await setSearch('иван');
    await setSearch('');

    const text = treeText();
    expect(text).toContain('Стройка');
    expect(text).toContain('Ремонт');
  });

  it('selects every project and debtor through the select-all checkbox', async () => {
    await createHost();

    const checkbox = fixture.nativeElement.querySelector(
      '.checkbox-input',
    ) as HTMLInputElement;
    checkbox.click();
    await tick();

    const result = host.selected()!;
    expect(result.map((p) => p.name).sort()).toEqual(['Ремонт', 'Стройка']);
    expect(result[0].debtors!.length).toBeGreaterThan(0);
    // 2 проекта + 3 должника
    expect(treeText()).toContain('5/4');
  });

  it('emits an empty selection after clear', async () => {
    await createHost();
    const clear = fixture.nativeElement.querySelector(
      'button.clear',
    ) as HTMLButtonElement;
    clear.click();
    await tick();

    expect(host.selected()).toEqual([]);
  });
});
