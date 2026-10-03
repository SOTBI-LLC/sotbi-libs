import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import type { Project } from '@sotbi/models';

import { SelectedProjectsComponent } from './selected-projects.component';

const project = (name: string, debtors: string[]): Partial<Project> =>
  ({
    id: name.length,
    name,
    debtors: debtors.map((d, i) => ({ id: i + 1, name: d })),
  }) as Partial<Project>;

@Component({
  imports: [SelectedProjectsComponent],
  template: `
    <selected-projects
      [all]="all()"
      [projects]="projects()"
      (selectFav)="favRequested.set(true)"
    />
  `,
})
class HostComponent {
  public readonly all = signal('2');
  public readonly projects = signal<Partial<Project>[]>([
    project('Проект А', ['Должник 1', 'Должник 2']),
    project('Проект Б', []),
  ]);
  public readonly favRequested = signal(false);
}

describe('SelectedProjects', () => {
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

  it('creates', async () => {
    await createHost();
    expect(fixture.nativeElement.querySelector('filter-block')).toBeTruthy();
  });

  it('shows the counter and favorite projects with their debtors', async () => {
    await createHost();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.summary')!.textContent).toContain('2');
    const tree = el.textContent!;
    expect(tree).toContain('Проект А');
    expect(tree).toContain('Должник 1');
    expect(tree).toContain('Должник 2');
    expect(tree).toContain('Проект Б');
  });

  it('shows the helper message when there are no favorite projects', async () => {
    await createHost((h) => h.projects.set([]));

    expect(fixture.nativeElement.textContent).toContain(
      'Добавьте проекты в "Избранное" с помощью кнопки "Выбрать"',
    );
  });

  it('emits selectFav when the select button is clicked', async () => {
    await createHost();
    expect(host.favRequested()).toBe(false);

    const button = fixture.nativeElement.querySelector(
      'button.clear',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(host.favRequested()).toBe(true);
  });
});
