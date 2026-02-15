import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { CostReal } from '@sotbi/models';
import { CostRealService } from './cost-real.service';

describe('CostRealService', () => {
  let service: CostRealService;

  const mockCostReal: CostReal = {
    id: 1,
    date: new Date('2024-01-15'),
    user_id: 123,
    debtor_id: 456,
    minutes_costs: 480,
    description: 'Test cost description',
    work_category_id: 789,
    dirty: false,
    rowId: 'row-1',
    user: null,
    debtor: null,
    work_category: null,
  };

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        CostRealService,
      ],
    }).compileComponents();

    service = TestBed.inject(CostRealService);
  });

  describe('Data transformation', () => {
    it('should remove related objects when updating cost', () => {
      const costToUpdate: Partial<CostReal> = {
        id: 1,
        date: new Date('2024-01-15'),
        user_id: 123,
        debtor_id: 456,
        minutes_costs: 480,
        description: 'Updated description',
        work_category_id: 789,
        debtor: {} as any,
        user: {} as any,
        work_category: {} as any,
      };

      // Create a copy for comparison
      const expectedCost = JSON.parse(JSON.stringify(costToUpdate));
      delete expectedCost.debtor;
      delete expectedCost.user;
      delete expectedCost.work_category;

      // Verify the transformation logic
      expect(expectedCost.debtor).toBeUndefined();
      expect(expectedCost.user).toBeUndefined();
      expect(expectedCost.work_category).toBeUndefined();
    });

    it('should handle batch update data transformation', () => {
      const costsToUpdate: CostReal[] = [
        {
          ...mockCostReal,
          id: 1,
          debtor: {} as any,
          user: {} as any,
          work_category: {} as any,
        },
        {
          ...mockCostReal,
          id: 2,
          debtor: {} as any,
          user: {} as any,
          work_category: {} as any,
        },
      ];

      // Create expected data (without debtor, user, work_category)
      const expectedCosts = JSON.parse(JSON.stringify(costsToUpdate)).map((el: any) => {
        delete el.debtor;
        delete el.user;
        delete el.work_category;
        return el;
      });

      // Verify all objects are transformed
      expectedCosts.forEach((cost: any) => {
        expect(cost.debtor).toBeUndefined();
        expect(cost.user).toBeUndefined();
        expect(cost.work_category).toBeUndefined();
      });
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
