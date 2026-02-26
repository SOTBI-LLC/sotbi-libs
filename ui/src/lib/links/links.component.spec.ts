import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { itemMap, ShortLink, SimpleEditModel } from '@sotbi/models';
import { Link } from '@sotbi/models';
import {
  getLinks,
  LinksComponent,
  styleClassesForLinks,
} from './links.component';

// Test component to access protected properties
class TestLinksComponent extends LinksComponent {
  // Expose protected properties for testing
  public get testLinks() {
    return this.links;
  }

  // Expose protected methods for testing
  public testGetLinksForSelect(links: SimpleEditModel[]) {
    return this.getLinksForSelect(links);
  }
  public testCanEdit(item: Link) {
    return this.canEdit(item);
  }
  public testAdd() {
    return this.add();
  }
  public testOnTryEdit(item: Link) {
    return this.onTryEdit(item);
  }
  public testOnSave() {
    return this.onSave();
  }
  public testClickedInside($event: Event) {
    return this.clickedInside($event);
  }
  public testDel(link: Link, index: number) {
    return this.del(link, index);
  }

  // Expose private properties for testing
  public get testSelected() {
    return (this as any).selected;
  }
  public get testCreate() {
    return (this as any).create;
  }
  public get testOld() {
    return (this as any).old;
  }
  public get testShortLinkRefs() {
    return (this as any).shortLinkRefs;
  }

  // Expose private methods for testing
  public testReset() {
    return (this as any).reset();
  }
  public testIsSelectedItem(item: Link) {
    return (this as any).isSelectedItem(item);
  }
  public testIsChangedEmit() {
    return (this as any).isChangedEmit();
  }

  // Helper methods to get input values
  public getInputIsDisabled() {
    return this.isDisabled();
  }
  public getInputShowAsTable() {
    return this.showAsTable();
  }
  public getInputLinkRefs() {
    return this.linkRefs();
  }
  public getInputIsEditMode() {
    return this.isEditMode();
  }
}

describe('LinksComponent', () => {
  let component: TestLinksComponent;
  let fixture: ComponentFixture<TestLinksComponent>;

  // Mock data
  const mockSimpleEditModel: SimpleEditModel = {
    id: 1,
    name: 'Test Link Type',
  };
  const mockLink: Link = {
    id: 1,
    uri: 'https://example.com',
    debtor_id: 123,
    type_id: 1,
    type: mockSimpleEditModel,
  };
  const mockLink2: Link = {
    id: 2,
    uri: 'https://test.com',
    debtor_id: 123,
    type_id: 2,
    type: { id: 2, name: 'Another Link Type' },
  };
  const mockLinks: SimpleEditModel[] = [
    mockSimpleEditModel,
    { id: 2, name: 'Another Link Type' },
  ];
  const mockLinkRefs: Link[] = [mockLink, mockLink2];

  beforeEach(async () => {
    // Override template to avoid complex DOM dependencies
    TestBed.overrideComponent(TestLinksComponent, {
      set: { template: '<div>Test template</div>' },
    });

    await TestBed.configureTestingModule({
      imports: [TestLinksComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestLinksComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('links', mockLinks);
    fixture.componentRef.setInput('debtorId', 123);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default input values', () => {
      expect(component.getInputIsDisabled()).toBe(false);
      expect(component.getInputShowAsTable()).toBe(true);
      expect(component.getInputLinkRefs()).toEqual([]);
      expect(component.getInputIsEditMode()).toBe(false);
    });

    it('should initialize and reset on ngOnInit', () => {
      fixture.componentRef.setInput('linkRefs', mockLinkRefs);
      component.ngOnInit();

      expect(component.getInputLinkRefs()).toEqual(mockLinkRefs);
      // old should be a clone of linkRefs
      expect(component.testOld).toEqual(mockLinkRefs);
    });

    it('should reset selected and create properties', () => {
      // Set some values first
      (component as any).selected = { id: 999 };
      (component as any).create = { id: 888, uri: 'test', type_id: 1 };

      component.testReset();

      expect(component.testSelected.id).toBe(0);
      expect(component.testCreate.id).toBe(0);
      expect(component.testCreate.uri).toBe('');
      expect(component.testCreate.type_id).toBe(-1);
    });
  });

  describe('Store Integration and Signals', () => {
    it('should get links from store', () => {
      expect(component.testLinks()).toEqual(mockLinks);
    });

    it('should get shortLinkRefs as Set of type_ids', () => {
      fixture.componentRef.setInput('linkRefs', mockLinkRefs);

      const result = component.testShortLinkRefs;
      expect(result).toEqual(new Set([1, 2]));
    });

    it('should filter links for select dropdown', () => {
      fixture.componentRef.setInput('linkRefs', [mockLink]); // Only type_id 1 is used

      const result = component.testGetLinksForSelect(mockLinks);
      expect(result).toEqual([{ id: 2, name: 'Another Link Type' }]); // Only type_id 2 should remain
    });

    it('should return empty array when links is not array', () => {
      const result = component.testGetLinksForSelect(null as any);
      expect(result).toEqual([]);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('linkRefs', [...mockLinkRefs]);
      fixture.componentRef.setInput('debtorId', 123);
      component.ngOnInit(); // Initialize old state
    });

    it('should add new link when valid', () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      (component as any).create = {
        id: 0,
        uri: 'https://newlink.com',
        type_id: 3,
        debtor_id: 123,
      };

      component.testAdd();

      const added = component
        .getInputLinkRefs()
        .find((l) => l.uri === 'https://newlink.com' && l.type_id === 3);
      expect(added).toBeDefined();
      expect(added?.debtor_id).toBe(123);
      expect(isChangedSpy).toHaveBeenCalled();
    });

    it('should not add link when disabled', () => {
      fixture.componentRef.setInput('isDisabled', true);
      const initialLength = component.getInputLinkRefs().length;

      (component as any).create = {
        id: 0,
        uri: 'https://newlink.com',
        type_id: 3,
      };

      component.testAdd();

      expect(component.getInputLinkRefs().length).toBe(initialLength);
    });

    it('should not add link when uri is empty', () => {
      const initialLength = component.getInputLinkRefs().length;

      (component as any).create = {
        id: 0,
        uri: '',
        type_id: 3,
      };

      component.testAdd();

      expect(component.getInputLinkRefs().length).toBe(initialLength);
    });

    it('should not add link when type_id is invalid', () => {
      const initialLength = component.getInputLinkRefs().length;

      (component as any).create = {
        id: 0,
        uri: 'https://newlink.com',
        type_id: -1,
      };

      component.testAdd();

      expect(component.getInputLinkRefs().length).toBe(initialLength);
    });

    it('should edit selected item', () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      // Select an item to edit
      component.testOnTryEdit(mockLink);
      (component as any).selected.uri = 'https://updated.com';

      component.testOnSave();

      const updatedLink = component
        .getInputLinkRefs()
        .find((l) => l.id === mockLink.id);
      expect(updatedLink?.uri).toBe('https://updated.com');
      expect(isChangedSpy).toHaveBeenCalled();
    });

    it('should not save when disabled', () => {
      fixture.componentRef.setInput('isDisabled', true);
      // Note: detectChanges() may trigger unwanted side effects, so we skip it

      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      component.testOnTryEdit(mockLink);
      (component as any).selected.uri = 'https://updated.com';

      component.testOnSave();

      // When disabled, isChanged should not be emitted
      expect(isChangedSpy).not.toHaveBeenCalled();
    });

    it('should delete new link (id = 0)', () => {
      const newLink = new Link({ id: 0, uri: 'https://temp.com', type_id: 3 });
      fixture.componentRef.setInput('linkRefs', [...mockLinkRefs, newLink]);
      component.ngOnInit(); // Reset old state

      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      component.testDel(newLink, 2);

      expect(component.getInputLinkRefs()).not.toContain(newLink);
      expect(isChangedSpy).toHaveBeenCalled();
    });

    it('should delete existing link', async () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      await component.testDel(mockLink, 0);

      expect(component.getInputLinkRefs()).not.toContain(mockLink);
      expect(isChangedSpy).toHaveBeenCalled();
    });

    it('should handle delete existing link successfully', async () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      // Delete existing link (id !== 0)
      await component.testDel(mockLink, 0);

      expect(component.getInputLinkRefs()).not.toContain(mockLink);
      expect(isChangedSpy).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('linkRefs', mockLinkRefs);
      component.ngOnInit();
    });

    it('should start editing when clicking on item', () => {
      component.testOnTryEdit(mockLink);

      expect(component.testSelected).toBe(mockLink);
    });

    it('should not start editing when disabled', () => {
      fixture.componentRef.setInput('isDisabled', true);

      component.testOnTryEdit(mockLink);

      expect(component.testSelected.id).toBe(0); // Should remain reset
    });

    it('should prevent event propagation when clicked inside', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      component.testClickedInside(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    // it('should reset selection when clicked outside', () => {
    //   component.testOnTryEdit(mockLink); // Select an item
    //   expect(component.testSelected).toBe(mockLink);

    //   component.clickedOutside();

    //   expect(component.testSelected).toEqual({ id: 0 });
    // });

    it('should emit change event when clicked outside and data changed', () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      // Modify data to be different from old
      fixture.componentRef.setInput('linkRefs', [
        ...mockLinkRefs,
        { id: 3, uri: 'https://new.com', type_id: 3 },
      ]);

      component.clickedOutside();

      expect(isChangedSpy).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should determine if item can be edited', () => {
      fixture.componentRef.setInput('isEditMode', false);

      // Not selected, not edit mode
      expect(component.testCanEdit(mockLink)).toBe(false);

      // Selected item
      component.testOnTryEdit(mockLink);
      expect(component.testCanEdit(mockLink)).toBe(true);

      // Edit mode enabled
      fixture.componentRef.setInput('isEditMode', true);
      expect(component.testCanEdit(mockLink2)).toBe(true); // Different item but edit mode
    });

    it('should check if item is selected', () => {
      component.testOnTryEdit(mockLink);

      expect(component.testIsSelectedItem(mockLink)).toBe(true);
      expect(component.testIsSelectedItem(mockLink2)).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should get links from array', () => {
      const links: Link[] = [
        new Link({ id: 1, uri: 'https://test.com', type_id: 1 }),
        new Link({ id: 2, uri: 'https://example.com', type_id: 2 }),
      ];
      const linksMap: itemMap = new Map([
        [1, 'Website'],
        [2, 'Documentation'],
      ]);

      const result: ShortLink[] = getLinks(links, linksMap);

      expect(result).toEqual([
        { name: 'Website', uri: 'https://test.com' },
        { name: 'Documentation', uri: 'https://example.com' },
      ]);
    });

    it('should return empty array when links is null', () => {
      const result: ShortLink[] = getLinks(null as any, new Map());
      expect(result).toEqual([]);
    });

    it('should return empty array when links is undefined', () => {
      const result: ShortLink[] = getLinks(undefined as any, new Map());
      expect(result).toEqual([]);
    });

    it('should provide correct style classes', () => {
      expect(styleClassesForLinks).toEqual([
        'table-aggrid--cell-wrap-text',
        'table-aggrid--overflow-auto',
      ]);
    });
  });

  describe('Input Signals and Reactivity', () => {
    it('should react to isDisabled changes', () => {
      expect(component.getInputIsDisabled()).toBe(false);

      fixture.componentRef.setInput('isDisabled', true);
      expect(component.getInputIsDisabled()).toBe(true);
    });

    it('should react to showAsTable changes', () => {
      expect(component.getInputShowAsTable()).toBe(true);

      fixture.componentRef.setInput('showAsTable', false);
      expect(component.getInputShowAsTable()).toBe(false);
    });

    it('should react to linkRefs changes', () => {
      expect(component.getInputLinkRefs()).toEqual([]);

      fixture.componentRef.setInput('linkRefs', mockLinkRefs);
      expect(component.getInputLinkRefs()).toEqual(mockLinkRefs);
    });

    it('should react to isEditMode changes', () => {
      expect(component.getInputIsEditMode()).toBe(false);

      fixture.componentRef.setInput('isEditMode', true);
      expect(component.getInputIsEditMode()).toBe(true);
    });
  });

  describe('Output Events', () => {
    it('should emit isChanged event', () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      fixture.componentRef.setInput('linkRefs', [
        ...mockLinkRefs,
        { id: 3, uri: 'https://new.com', type_id: 3 },
      ]);

      component.testIsChangedEmit();

      expect(isChangedSpy).toHaveBeenCalled();
    });

    it('should not emit isChanged when data is unchanged', () => {
      const isChangedSpy = jest.fn();
      component.isChanged.subscribe(isChangedSpy);

      fixture.componentRef.setInput('linkRefs', mockLinkRefs);
      component.ngOnInit(); // This sets old = structuredClone(linkRefs)

      component.testIsChangedEmit();

      expect(isChangedSpy).not.toHaveBeenCalled();
    });
  });
});
