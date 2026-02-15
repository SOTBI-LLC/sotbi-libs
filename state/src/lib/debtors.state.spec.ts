import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DebtorService } from '@sotbi/data-access';
import type { Debtor } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { DebtorsState, UniqueDebtorINNValidator } from './debtors.state';

describe('UniqueDebtorINNValidator', () => {
  let validator: UniqueDebtorINNValidator;
  let debtorService: jest.Mocked<DebtorService>;

  beforeEach(async () => {
    const serviceSpy = {
      checkInn: jest.fn(),
    } as unknown as jest.Mocked<DebtorService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: DebtorService, useValue: serviceSpy },
        UniqueDebtorINNValidator,
      ],
    }).compileComponents();

    validator = TestBed.inject(UniqueDebtorINNValidator);
    debtorService = TestBed.inject(
      DebtorService,
    ) as jest.Mocked<DebtorService>;
  });

  it('should be created', () => {
    expect(validator).toBeTruthy();
  });

  it('should return null for pristine control', () => {
    const control = new FormControl('1234567890');
    control.markAsPristine();

    validator.validate(control).subscribe((result) => {
      expect(result).toBeNull();
    });
  });

  it('should return null for invalid INN length', () => {
    const control = new FormControl('123456789'); // 9 digits
    control.markAsDirty();

    validator.validate(control).subscribe((result) => {
      expect(result).toBeNull();
    });
  });

  it('should call checkInn for valid 10-digit INN', () => {
    const control = new FormControl('1234567890');
    control.markAsDirty();
    debtorService.checkInn.mockReturnValue(of([]));

    validator.validate(control).subscribe((result) => {
      expect(result).toBeNull();
      expect(debtorService.checkInn).toHaveBeenCalledWith('1234567890');
    });
  });

  it('should return validation error when INN conflicts found', () => {
    const control = new FormControl('1234567890');
    control.markAsDirty();
    debtorService.checkInn.mockReturnValue(of([1, 2, 3]));

    validator.validate(control).subscribe((result) => {
      expect(result).toEqual({ uniqueDebtorError: true });
    });
  });

  it('should handle service errors gracefully', () => {
    const control = new FormControl('1234567890');
    control.markAsDirty();
    debtorService.checkInn.mockReturnValue(
      throwError(() => new Error('Service error')),
    );
    spyOn(console, 'error');

    validator.validate(control).subscribe((result) => {
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

describe('DebtorsState Static Methods', () => {
  const mockDebtor: Debtor = {
    id: 1,
    name: 'Test Debtor LLC',
    full_name: 'Test Debtor Limited Liability Company',
    inn: '1234567890',
    kpp: '123456789',
    ogrn: '1234567890123',
    address: '123 Test Street, Test City',
    post_address: 'PO Box 123, Test City',
    arbitration_id: 'ARB123',
    case_no: 'CASE-001',
    decision_date: new Date('2024-01-15'),
    initiation_date: new Date('2024-01-01'),
    procedure_date: new Date('2024-02-01'),
    bankruptcy_manager_id: 1,
    project_id: 1,
    project: {
      id: 1,
      name: 'Test Project',
      created_at: new Date('2023-12-01'),
    },
    stage_id: 1,
    kind: false,
    reportable: true,
    category_id: 1,
    procedure_id: 1,
    links: [],
    registry: 1000000,
    deposit: 500000,
    not_deposit: 300000,
    deposit_share: 50,
    not_deposit_share: 30,
    profit_cat: { id: 1, name: 'High' },
    profit_cat_id: 1,
    created_at: new Date('2024-01-01'),
    bank_details: [],
    insurance_policies: [],
  };

  describe('debtorConvertFunction', () => {
    it('should convert Debtor to DebtorsList correctly', () => {
      const result = DebtorsState.debtorConvertFunction(mockDebtor);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockDebtor.id);
      expect(result?.name).toBe(mockDebtor.name);
      expect(result?.full_name).toBe(mockDebtor.full_name);
      expect(result?.inn).toBe(mockDebtor.inn);
      expect(result?.kind).toBe('юр.лицо');
      expect(result?.reportable).toBe('да');
    });

    it('should handle physical person type correctly', () => {
      const physicalDebtor = { ...mockDebtor, kind: true };
      const result = DebtorsState.debtorConvertFunction(physicalDebtor);

      expect(result?.kind).toBe('физ.лицо');
    });

    it('should handle non-reportable debtor correctly', () => {
      const nonReportableDebtor = { ...mockDebtor, reportable: false };
      const result = DebtorsState.debtorConvertFunction(nonReportableDebtor);

      expect(result?.reportable).toBe('нет');
    });

    it('should handle null input', () => {
      const result = DebtorsState.debtorConvertFunction(undefined);
      expect(result).toBeNull();
    });

    it('should handle empty object', () => {
      const result = DebtorsState.debtorConvertFunction({});
      expect(result).toBeDefined();
      expect(result?.category_name).toBe('');
      expect(result?.kind).toBe('юр.лицо');
      expect(result?.reportable).toBe('нет');
    });
  });

  //TODO: Move to forms
  /*
  describe('initDebtorFormGroup', () => {
    it('should create form group with default values', () => {
      const formGroup = DebtorsState.initDebtorFormGroup();

      expect(formGroup).toBeDefined();
      expect(formGroup.get('id').value).toBe(0);
      expect(formGroup.get('name').value).toBe('');
      expect(formGroup.get('inn').value).toBeNull();
      expect(formGroup.get('kind').value).toBe(false);
    });

    it('should create form group with debtor data', () => {
      const formGroup = DebtorsState.initDebtorFormGroup(mockDebtor);

      expect(formGroup.get('id').value).toBe(mockDebtor.id);
      expect(formGroup.get('name').value).toBe(mockDebtor.name);
      expect(formGroup.get('inn').value).toBe(mockDebtor.inn);
      expect(formGroup.get('full_name').value).toBe(mockDebtor.full_name);
    });

    it('should handle null debtor', () => {
      const formGroup = DebtorsState.initDebtorFormGroup(null);

      expect(formGroup.get('id').value).toBe(0);
      expect(formGroup.get('name').value).toBe('');
    });

    it('should validate INN field correctly', () => {
      const formGroup = DebtorsState.initDebtorFormGroup();
      const innControl = formGroup.get('inn');

      // Test required validation
      innControl.setValue('');
      expect(innControl.invalid).toBe(true);
      expect(innControl.errors?.required).toBeTruthy();

      // Test pattern validation for 10-digit INN
      innControl.setValue('1234567890');
      // The control should at least pass basic pattern validation
      expect(innControl.errors?.pattern).toBeFalsy();

      // Test pattern validation for 12-digit INN
      innControl.setValue('123456789012');
      expect(innControl.errors?.pattern).toBeFalsy();

      // Test invalid INN (too short)
      innControl.setValue('123');
      expect(innControl.invalid).toBe(true);
      expect(innControl.errors?.minlength).toBeTruthy();
    });

    it('should handle form creation for complex debtor data', () => {
      const complexDebtor: Partial<Debtor> = {
        id: 1,
        name: 'Complex Test Debtor',
        inn: '1234567890',
        links: [
          {
            id: 1,
            type: { id: 1, name: 'website' },
            type_id: 1,
            uri: 'https://example.com',
            debtor_id: 1,
          },
        ],
        bank_details: [
          {
            id: 1,
            name: 'Main Account',
            bank: 'Test Bank',
            bank_account: '40702810400000000001',
            bik: '044525225',
            corr_account: '30101810400000000225',
            city: 'Test City',
            location: 'Test Location',
            open_date: new Date('2024-01-01'),
            close_date: null,
            account_type: { id: 1, name: 'Current' },
            account_type_id: 1,
            has_client_bank: true,
          },
        ],
      };

      const formGroup = DebtorsState.initDebtorFormGroup(complexDebtor);

      expect(formGroup).toBeDefined();
      expect(formGroup.get('id').value).toBe(1);
      expect(formGroup.get('name').value).toBe('Complex Test Debtor');

      // Check that arrays are properly created
      const linksArray = formGroup.get('links') as FormArray;
      const bankDetailsArray = formGroup.get('bank_details') as FormArray;

      expect(linksArray.controls.length).toBe(1);
      expect(bankDetailsArray.controls.length).toBe(1);
      expect(bankDetailsArray.controls[0].get('bank_account').value).toBe(
        '40702810400000000001',
      );
    });
  });
  */

  describe('prepForSave', () => {
    it('should return changes between old and new debtor', () => {
      const oldDebtor = { ...mockDebtor };
      const newDebtor = {
        ...mockDebtor,
        name: 'Updated Name',
        inn: '0987654321',
      };

      const result = DebtorsState.prepForSave(oldDebtor, newDebtor, new Set());

      expect(result).toEqual({
        name: 'Updated Name',
        inn: '0987654321',
      });
    });

    it('should handle array changes correctly', () => {
      const oldDebtor = { ...mockDebtor, links: [] };
      const newDebtor = {
        ...mockDebtor,
        links: [
          {
            id: 1,
            type: { id: 1, name: 'url' },
            type_id: 1,
            uri: 'http://test.com',
            debtor_id: 1,
          },
        ],
      };

      const result = DebtorsState.prepForSave(oldDebtor, newDebtor, new Set());

      expect(result?.links).toEqual(newDebtor.links);
    });

    it('should return null when no changes', () => {
      const result = DebtorsState.prepForSave(
        mockDebtor,
        mockDebtor,
        new Set(),
      );

      expect(result).toBeNull();
    });

    it('should ignore nullable fields', () => {
      const oldDebtor = { ...mockDebtor };
      const newDebtor = {
        ...mockDebtor,
        name: 'Updated Name',
        inn: 'different',
      };
      const nullables = new Set(['inn']);

      const result = DebtorsState.prepForSave(oldDebtor, newDebtor, nullables);

      expect(result).toEqual({ name: 'Updated Name' });
    });

    it('should handle new debtor creation', () => {
      const oldDebtor = { ...mockDebtor, id: 0 };
      const newDebtor = { ...mockDebtor, id: 0, name: 'New Debtor', inn: '' };

      const result = DebtorsState.prepForSave(oldDebtor, newDebtor, new Set());

      expect(result).toEqual({ name: 'New Debtor' });
    });
  });
});

describe('DebtorsState Integration', () => {
  it('should have correct static method functionality', () => {
    // Test the debtorConvertFunction with a complete example
    const testDebtor: Debtor = {
      id: 42,
      name: 'Integration Test Debtor',
      full_name: 'Integration Test Debtor Full Name',
      inn: '1234567890',
      kpp: '123456789',
      ogrn: '1234567890123',
      address: 'Test Integration Address',
      post_address: 'Test Integration Post Address',
      arbitration_id: 'INT-ARB-001',
      case_no: 'INT-CASE-001',
      decision_date: new Date('2024-01-15'),
      bankruptcy_manager_id: 1,
      project_id: 1,
      project: { id: 1, name: 'Integration Project' },
      links: [],
      profit_cat: { id: 1, name: 'High Profit' },
      bank_details: [],
      insurance_policies: [],
      kind: false,
      reportable: true,
    };

    const converted = DebtorsState.debtorConvertFunction(testDebtor);

    expect(converted).toBeDefined();
    expect(converted?.id).toBe(42);
    expect(converted?.name).toBe('Integration Test Debtor');
    expect(converted?.kind).toBe('юр.лицо');
    expect(converted?.reportable).toBe('да');
  });

  it('should properly compare debtors for save preparation', () => {
    const originalDebtor: Debtor = {
      id: 1,
      name: 'Original Name',
      inn: '1234567890',
      full_name: 'Original Full Name',
      kpp: '123456789',
      ogrn: '1234567890123',
      address: 'Original Address',
      post_address: 'Original Post Address',
      arbitration_id: 'ARB001',
      case_no: 'CASE-001',
      decision_date: new Date('2024-01-01'),
      bankruptcy_manager_id: 1,
      project_id: 1,
      project: { id: 1, name: 'Original Project' },
      links: [],
      profit_cat: { id: 1, name: 'Low' },
      bank_details: [],
      insurance_policies: [],
    };

    const modifiedDebtor: Debtor = {
      ...originalDebtor,
      name: 'Modified Name',
      inn: '0987654321',
      profit_cat: { id: 2, name: 'High' },
    };

    const changes = DebtorsState.prepForSave(
      originalDebtor,
      modifiedDebtor,
      new Set(),
    );

    expect(changes).toEqual({
      name: 'Modified Name',
      inn: '0987654321',
      profit_cat: { id: 2, name: 'High' },
    });
  });
});
