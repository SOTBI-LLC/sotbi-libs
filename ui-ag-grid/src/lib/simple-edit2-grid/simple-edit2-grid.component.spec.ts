import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import type { SimpleEdit2Model } from '@sotbi/models';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { SimpleEdit2GridComponent } from './simple-edit2-grid.component';

/** Устойчивое ожидание результата через UI без обращения к приватным методам компонента. */
async function waitFor(assertion: () => void, timeoutMs = 5000): Promise<void> {
  const startedAt = Date.now();
  for (;;) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() - startedAt > timeoutMs) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

@Component({
  imports: [SimpleEdit2GridComponent],
  template: `
    <simple-edit2-grid
      [items]="items"
      [allowedToDelete]="allowedToDelete()"
      [hiddenColumn]="true"
      (action)="actioned.set($event)"
      (delete)="deleted.set($event)"
      (selectedId)="selectedIdValue.set($event)"
    />
  `,
})
class HostComponent {
  public items: SimpleEdit2Model[] = [
    { id: 1, name: 'Первый', kind: true },
    { id: 2, name: 'Второй', kind: false },
  ];
  public readonly allowedToDelete = signal(false);
  public readonly actioned = signal<SimpleEdit2Model | null>(null);
  public readonly deleted = signal<number | null>(null);
  public readonly selectedIdValue = signal<number | null>(null);
}

describe('SimpleEdit2Grid', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const createHost = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // грид инициализируется асинхронно; whenStable на нём не завершается
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  beforeAll(() => {
    ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
  });

  it('creates and renders the passed rows', async () => {
    await createHost();

    expect(fixture.nativeElement.querySelector('ag-grid-angular')).toBeTruthy();
    await waitFor(() => {
      const text = (fixture.nativeElement as HTMLElement).textContent!;
      expect(text).toContain('Первый');
      expect(text).toContain('Второй');
    });
  });

  it('shows the configured captions', async () => {
    await createHost();

    await waitFor(() => {
      const text = (fixture.nativeElement as HTMLElement).textContent!;
      expect(text).toContain('Наименование');
      expect(text).toContain('№ п.п.');
      // колонка «Тип» скрыта hiddenColumn=true
      expect(text).not.toContain('Показывать');
    });
  });

  it('selects a row on click and emits its id', async () => {
    await createHost();

    await waitFor(() => {
      const cell = Array.from(
        fixture.nativeElement.querySelectorAll('.ag-cell'),
      ).find((el) => (el as HTMLElement).textContent!.includes('Первый')) as HTMLElement;
      expect(cell).toBeTruthy();
      cell.click();
    });
    await waitFor(() => {
      expect(host.selectedIdValue()).toBe(1);
    });
  });
});
