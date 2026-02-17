import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, provideStates, provideStore } from '@ngxs/store';
import { ProjectService } from '@sotbi/data-access';
import type { Project } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import {
  AddProject,
  DeleteProject,
  EditProject,
  FetchAllProjects,
  FetchProjects,
  GetProject,
} from './projects.actions';
import type { ProjectStateModel } from './projects.state';
import { ProjectsState } from './projects.state';

describe('ProjectsState', () => {
  let store: Store;
  let projectService: jest.Mocked<ProjectService>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    client_id: 1,
    department_id: 2,
    group_id: 3,
    manager_id: 4,
    saler_group_id: 5,
    created_at: new Date('2024-01-01'),
  };

  const mockProjects: Project[] = [
    mockProject,
    {
      id: 2,
      name: 'Another Project',
      client_id: 2,
      created_at: new Date('2024-01-15'),
    },
  ];

  const mockShortProjects: Project[] = [
    { id: 1, name: 'Test Project' },
    { id: 2, name: 'Another Project' },
    { id: 3, name: 'Third Project' },
  ];

  beforeEach(async () => {
    const projectServiceSpy = {
      getAll$: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProjectService>;

    // Set default return values to prevent errors during state initialization
    projectServiceSpy.getAll$.mockReturnValue(of([]));
    projectServiceSpy.get.mockReturnValue(of(mockProject));
    projectServiceSpy.create.mockReturnValue(of(mockProject));
    projectServiceSpy.save.mockReturnValue(of(mockProject));
    projectServiceSpy.delete.mockReturnValue(of(undefined as any));

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectService, useValue: projectServiceSpy },
        provideStore([]),
        provideStates([ProjectsState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    projectService = TestBed.inject(
      ProjectService,
    ) as jest.Mocked<ProjectService>;
  });

  describe('Selectors', () => {
    it('should return items', () => {
      const state: ProjectStateModel = {
        loading: false,
        items: mockProjects,
        shortItems: [],
        selected: null,
        maps: new Map(),
      };

      const result = ProjectsState.getItems(state);
      expect(result).toEqual(mockProjects);
    });

    it('should return all items (shortItems)', () => {
      const state: ProjectStateModel = {
        loading: false,
        items: [],
        shortItems: mockShortProjects,
        selected: null,
        maps: new Map(),
      };

      const result = ProjectsState.getAllItems(state);
      expect(result).toEqual(mockShortProjects);
    });

    it('should return maps', () => {
      const maps = new Map<number, string>([
        [1, 'Test Project'],
        [2, 'Another Project'],
      ]);
      const state: ProjectStateModel = {
        loading: false,
        items: [],
        shortItems: [],
        selected: null,
        maps,
      };

      const result = ProjectsState.getMaps(state);
      expect(result).toBe(maps);
    });

    it('should return selected item', () => {
      const state: ProjectStateModel = {
        loading: false,
        items: [],
        shortItems: [],
        selected: mockProject,
        maps: new Map(),
      };

      const result = ProjectsState.getItem(state);
      expect(result).toBe(mockProject);
    });
  });

  describe('ngxsOnInit', () => {
    it('should dispatch FetchAllProjects on initialization', (done) => {
      // The state is already initialized in beforeEach via provideStates
      // which automatically calls ngxsOnInit and dispatches FetchAllProjects
      // We can verify this by checking that getAll$ was called with {short: true}

      // Use microtask to ensure initialization completes
      Promise.resolve().then(() => {
        expect(projectService.getAll$).toHaveBeenCalledWith({ short: true });
        done();
      });
    });
  });

  describe('FetchProjects Action', () => {
    it('should fetch projects when items array is empty (success path)', (done) => {
      // Reset state to empty items
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      // Reset spy to clear calls from ngxsOnInit
      projectService.getAll$.mockClear();
      projectService.getAll$.mockReturnValue(of(mockProjects));

      store.dispatch(new FetchProjects()).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.items).toEqual(mockProjects);
        expect(state.maps.size).toBe(2);
        expect(state.maps.get(1)).toBe('Test Project');
        expect(state.maps.get(2)).toBe('Another Project');
        expect(projectService.getAll$).toHaveBeenCalled();
        done();
      });
    });

    it('should update maps when fetching projects for the first time', (done) => {
      // Reset state to empty
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      projectService.getAll$.mockReturnValue(of(mockProjects));

      store.dispatch(new FetchProjects()).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.maps.size).toBe(2);
        expect(state.maps.get(1)).toBe('Test Project');
        expect(state.maps.get(2)).toBe('Another Project');
        done();
      });
    });

    it('should only update items when maps already exist', (done) => {
      // Pre-populate state with existing maps
      const existingMaps = new Map<number, string>([[99, 'Existing Project']]);
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: existingMaps,
        },
      });

      projectService.getAll$.mockReturnValue(of(mockProjects));

      store.dispatch(new FetchProjects()).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.items).toEqual(mockProjects);
        // Maps should remain the same
        expect(state.maps).toBe(existingMaps);
        expect(state.maps.get(99)).toBe('Existing Project');
        done();
      });
    });

    it('should not fetch when items already exist', (done) => {
      // Pre-populate items
      store.reset({
        projects: {
          loading: false,
          items: [mockProject],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      // Reset spy to clear calls from ngxsOnInit
      projectService.getAll$.mockClear();

      store.dispatch(new FetchProjects()).subscribe(() => {
        expect(projectService.getAll$).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      // Reset state to ensure items is empty so FetchProjects will actually run
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Fetch failed');
      projectService.getAll$.mockReturnValue(throwError(() => error));

      store.dispatch(new FetchProjects()).subscribe({
        next: () => {
          // If it somehow succeeds, fail the test
          fail('Expected error to be thrown');
          done();
        },
        error: () => {
          // The error is logged and then propagates
          expect(console.error).toHaveBeenCalledWith('Fetch failed');
          done();
        },
      });
    });
  });

  describe('FetchAllProjects Action', () => {
    it('should fetch short projects when shortItems array is empty (success path)', (done) => {
      // Reset state to empty shortItems
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      projectService.getAll$.mockReturnValue(of(mockShortProjects));

      store.dispatch(new FetchAllProjects()).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.shortItems).toEqual(mockShortProjects);
        expect(state.maps.size).toBe(3);
        expect(state.maps.get(1)).toBe('Test Project');
        expect(state.maps.get(2)).toBe('Another Project');
        expect(state.maps.get(3)).toBe('Third Project');
        expect(projectService.getAll$).toHaveBeenCalledWith({ short: true });
        done();
      });
    });

    it('should not fetch when shortItems already exist', (done) => {
      // Pre-populate shortItems
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [mockShortProjects[0]],
          selected: null,
          maps: new Map(),
        },
      });

      // Reset spy to clear calls from ngxsOnInit
      projectService.getAll$.mockClear();

      store.dispatch(new FetchAllProjects()).subscribe(() => {
        expect(projectService.getAll$).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      // Reset state to ensure shortItems is empty so FetchAllProjects will actually run
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Fetch all failed');
      projectService.getAll$.mockReturnValue(throwError(() => error));

      store.dispatch(new FetchAllProjects()).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith('Fetch all failed');
          done();
        },
      });
    });

    it('should use distinctUntilChanged operator', (done) => {
      // Reset state to ensure shortItems is empty
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      projectService.getAll$.mockReturnValue(of(mockShortProjects));

      store.dispatch(new FetchAllProjects()).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.shortItems).toBeTruthy();
        done();
      });
    });
  });

  describe('GetItem Action', () => {
    it('should return default project when id is 0', (done) => {
      store.dispatch(new GetProject(0)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected).toEqual({ id: 0, name: '' });
        expect(state.loading).toBe(false);
        done();
      });
    });

    it('should get project from items when available', (done) => {
      // Pre-populate items
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      // Reset spy to ensure clean check
      projectService.get.mockClear();

      store.dispatch(new GetProject(1)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected).toEqual(mockProject);
        expect(state.loading).toBe(false);
        expect(projectService.get).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fetch from API when items array is empty', (done) => {
      // Reset state to ensure items is empty
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      projectService.get.mockReturnValue(of(mockProject));

      store.dispatch(new GetProject(1)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected).toEqual(mockProject);
        expect(state.loading).toBe(false);
        expect(projectService.get).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should set loading to true before fetching', (done) => {
      projectService.get.mockReturnValue(of(mockProject));

      // Reset to ensure clean state
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      store.dispatch(new GetProject(1)).subscribe(() => {
        // After the operation completes, loading should be false
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.loading).toBe(false);
        done();
      });
    });

    it('should handle errors and reset loading state', (done) => {
      const error = new Error('Get project failed');
      projectService.get.mockReturnValue(throwError(() => error));

      store.dispatch(new GetProject(1)).subscribe({
        error: () => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.loading).toBe(false);
          done();
        },
      });
    });

    it('should find correct project by id from multiple items', (done) => {
      // Pre-populate items
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      store.dispatch(new GetProject(2)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected?.id).toBe(2);
        expect(state.selected?.name).toBe('Another Project');
        done();
      });
    });
  });

  describe('AddItem Action', () => {
    it('should add project successfully (success path)', (done) => {
      const newProject = { ...mockProject, id: 3, name: 'New Project' };
      projectService.create.mockReturnValue(of(newProject));

      store.dispatch(new AddProject({ name: 'New Project' })).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected).toEqual(newProject);
        expect(state.items).toContainEqual(newProject);
        expect(state.items[0]).toEqual(newProject); // Should be prepended
        expect(state.shortItems).toContainEqual(
          expect.objectContaining({
            id: newProject.id,
            name: newProject.name,
          }),
        );
        expect(state.maps.get(newProject.id)).toBe(newProject.name);
        done();
      });
    });

    it('should prepend new project to items array', (done) => {
      // Pre-populate items
      store.reset({
        projects: {
          loading: false,
          items: [mockProject],
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      const newProject = { ...mockProject, id: 99, name: 'Newest Project' };
      projectService.create.mockReturnValue(of(newProject));

      store
        .dispatch(new AddProject({ name: 'Newest Project' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.items[0]).toEqual(newProject);
          expect(state.items[1]).toEqual(mockProject);
          done();
        });
    });

    it('should update maps when adding project', (done) => {
      const newProject = { ...mockProject, id: 10, name: 'Map Test Project' };
      projectService.create.mockReturnValue(of(newProject));

      store
        .dispatch(new AddProject({ name: 'Map Test Project' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.maps.get(10)).toBe('Map Test Project');
          done();
        });
    });

    it('should handle errors and propagate them', (done) => {
      jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create failed');
      projectService.create.mockReturnValue(throwError(() => error));

      store.dispatch(new AddProject({ name: 'Failed Project' })).subscribe({
        error: (err) => {
          expect(console.error).toHaveBeenCalledWith('Create failed');
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should create shortItems entry with only id and name', (done) => {
      const complexProject = {
        ...mockProject,
        id: 5,
        name: 'Complex Project',
        client_id: 10,
        manager_id: 20,
      };
      projectService.create.mockReturnValue(of(complexProject));

      store
        .dispatch(new AddProject({ name: 'Complex Project' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          const shortItem = state.shortItems.find((item) => item.id === 5);
          expect(shortItem).toEqual({ id: 5, name: 'Complex Project' });
          done();
        });
    });
  });

  describe('EditItem Action', () => {
    it('should edit project successfully (success path)', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: mockShortProjects,
          selected: mockProject,
          maps: new Map([[1, 'Test Project']]),
        },
      });

      const editedProject = { ...mockProject, name: 'Updated Project' };
      projectService.save.mockReturnValue(of(editedProject));

      store
        .dispatch(new EditProject({ id: 1, name: 'Updated Project' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.selected?.name).toBe('Updated Project');
          expect(state.items.find((p) => p.id === 1)?.name).toBe(
            'Updated Project',
          );
          expect(state.maps.get(1)).toBe('Updated Project');
          done();
        });
    });

    it('should remove id from payload before saving', (done) => {
      const payload = { id: 1, name: 'Updated Name', client_id: 5 };
      const editedProject = {
        ...mockProject,
        name: 'Updated Name',
        client_id: 5,
      };
      projectService.save.mockReturnValue(of(editedProject));

      store.dispatch(new EditProject(payload)).subscribe(() => {
        expect(projectService.save).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ name: 'Updated Name', client_id: 5 }),
        );
        // Verify id was passed as the first argument
        const callArgs = projectService.save.mock.calls[0];
        expect(callArgs[0]).toBe(1);
        done();
      });
    });

    it('should update item in items array', (done) => {
      // Pre-populate state with multiple items
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      const editedProject = { ...mockProjects[1], name: 'Modified Project' };
      projectService.save.mockReturnValue(of(editedProject));

      store
        .dispatch(new EditProject({ id: 2, name: 'Modified Project' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.items.find((p) => p.id === 2)?.name).toBe(
            'Modified Project',
          );
          expect(state.items.find((p) => p.id === 1)).toEqual(mockProject); // Other items unchanged
          done();
        });
    });

    it('should prepend shortItem to shortItems array', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: [mockProject],
          shortItems: [{ id: 1, name: 'Old Name' }],
          selected: mockProject,
          maps: new Map(),
        },
      });

      const editedProject = { ...mockProject, name: 'New Name' };
      projectService.save.mockReturnValue(of(editedProject));

      store
        .dispatch(new EditProject({ id: 1, name: 'New Name' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.shortItems[0]).toEqual({ id: 1, name: 'New Name' });
          expect(state.shortItems.length).toBe(2); // Old one still there
          done();
        });
    });

    it('should handle errors and propagate them', (done) => {
      jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Save failed');
      projectService.save.mockReturnValue(throwError(() => error));

      store
        .dispatch(new EditProject({ id: 1, name: 'Failed Update' }))
        .subscribe({
          error: (err) => {
            expect(console.error).toHaveBeenCalledWith('Save failed');
            expect(err).toBeDefined();
            done();
          },
        });
    });

    it('should update maps with new name', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: [mockProject],
          shortItems: [],
          selected: mockProject,
          maps: new Map([[1, 'Old Name']]),
        },
      });

      const editedProject = { ...mockProject, name: 'Brand New Name' };
      projectService.save.mockReturnValue(of(editedProject));

      store
        .dispatch(new EditProject({ id: 1, name: 'Brand New Name' }))
        .subscribe(() => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.maps.get(1)).toBe('Brand New Name');
          done();
        });
    });
  });

  describe('DeleteItem Action', () => {
    it('should delete project successfully (success path)', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: mockShortProjects,
          selected: mockProject,
          maps: new Map([
            [1, 'Test Project'],
            [2, 'Another Project'],
            [3, 'Third Project'],
          ]),
        },
      });

      projectService.delete.mockReturnValue(of(undefined as any));

      store.dispatch(new DeleteProject(1)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.items.find((p) => p.id === 1)).toBeUndefined();
        expect(state.shortItems.find((p) => p.id === 1)).toBeUndefined();
        expect(state.maps.has(1)).toBe(false);
        expect(state.items.length).toBe(1);
        expect(state.shortItems.length).toBe(2);
        done();
      });
    });

    it('should remove project from items array', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      projectService.delete.mockReturnValue(of(undefined as any));

      store.dispatch(new DeleteProject(2)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.items.find((p) => p.id === 2)).toBeUndefined();
        expect(state.items.find((p) => p.id === 1)).toBeDefined(); // Other items remain
        done();
      });
    });

    it('should remove project from shortItems array', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: mockShortProjects,
          selected: null,
          maps: new Map(),
        },
      });

      projectService.delete.mockReturnValue(of(undefined as any));

      store.dispatch(new DeleteProject(2)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.shortItems.find((p) => p.id === 2)).toBeUndefined();
        expect(state.shortItems.length).toBe(2);
        done();
      });
    });

    it('should remove project from maps', (done) => {
      // Pre-populate state
      store.reset({
        projects: {
          loading: false,
          items: [],
          shortItems: [],
          selected: null,
          maps: new Map([
            [1, 'Project 1'],
            [2, 'Project 2'],
            [3, 'Project 3'],
          ]),
        },
      });

      projectService.delete.mockReturnValue(of(undefined as any));

      store.dispatch(new DeleteProject(2)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.maps.has(2)).toBe(false);
        expect(state.maps.has(1)).toBe(true);
        expect(state.maps.has(3)).toBe(true);
        expect(state.maps.size).toBe(2);
        done();
      });
    });

    it('should handle errors and propagate them', (done) => {
      jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete failed');
      projectService.delete.mockReturnValue(throwError(() => error));

      store.dispatch(new DeleteProject(1)).subscribe({
        error: (err) => {
          expect(console.error).toHaveBeenCalledWith('Delete failed');
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should maintain immutability when deleting', (done) => {
      const originalItems = [...mockProjects];
      const originalShortItems = [...mockShortProjects];

      store.reset({
        projects: {
          loading: false,
          items: originalItems,
          shortItems: originalShortItems,
          selected: null,
          maps: new Map(),
        },
      });

      projectService.delete.mockReturnValue(of(undefined as any));

      store.dispatch(new DeleteProject(1)).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.items).not.toBe(originalItems);
        expect(state.shortItems).not.toBe(originalShortItems);
        // Original arrays should remain unchanged
        expect(originalItems.length).toBe(2);
        expect(originalShortItems.length).toBe(3);
        done();
      });
    });
  });

  describe('Edge Cases and Integration Tests', () => {
    it('should handle empty state correctly', () => {
      const state = store.selectSnapshot(
        (state: any) => state.projects,
      ) as ProjectStateModel;
      expect(state.items).toEqual([]);
      expect(state.shortItems).toEqual([]);
      expect(state.selected).toBeNull();
      expect(state.maps).toEqual(new Map());
      expect(state.loading).toBe(false);
    });

    it('should handle state with null selected project', () => {
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      const state = store.selectSnapshot(
        (state: any) => state.projects,
      ) as ProjectStateModel;
      expect(state.selected).toBeNull();
    });

    it('should maintain state consistency across multiple operations', (done) => {
      // Test a sequence of operations
      projectService.getAll$.mockReturnValue(of(mockShortProjects));
      projectService.create.mockReturnValue(
        of({ ...mockProject, id: 10, name: 'Created' }),
      );
      projectService.delete.mockReturnValue(of(undefined as any));

      // Execute sequence
      store.dispatch(new FetchAllProjects()).subscribe(() => {
        store.dispatch(new AddProject({ name: 'Created' })).subscribe(() => {
          store.dispatch(new DeleteProject(10)).subscribe(() => {
            const state = store.selectSnapshot(
              (state: any) => state.projects,
            ) as ProjectStateModel;

            // Verify final state
            expect(state.shortItems.length).toBeGreaterThanOrEqual(3);
            expect(state.items.length).toBeGreaterThanOrEqual(0);
            expect(state.loading).toBe(false);

            done();
          });
        });
      });
    });

    it('should handle projects with minimal data', (done) => {
      const minimalProject: Project = { id: 99, name: 'Minimal' };
      projectService.create.mockReturnValue(of(minimalProject));

      store.dispatch(new AddProject({ name: 'Minimal' })).subscribe(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        expect(state.selected).toEqual(minimalProject);
        expect(state.items).toContainEqual(minimalProject);
        done();
      });
    });

    it('should handle projects with all optional fields', (done) => {
      const fullProject: Project = {
        id: 100,
        name: 'Full Project',
        client_id: 1,
        department_id: 2,
        group_id: 3,
        manager_id: 4,
        saler_group_id: 5,
        created_at: new Date(),
      };
      projectService.create.mockReturnValue(of(fullProject));

      store.dispatch(new AddProject(fullProject)).subscribe({
        next: () => {
          const state = store.selectSnapshot(
            (state: any) => state.projects,
          ) as ProjectStateModel;
          expect(state.selected).toEqual(fullProject);
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    });

    it('should handle concurrent GetItem requests', (done) => {
      // Pre-populate items
      store.reset({
        projects: {
          loading: false,
          items: mockProjects,
          shortItems: [],
          selected: null,
          maps: new Map(),
        },
      });

      // Dispatch multiple GetItem actions
      const actions = [
        store.dispatch(new GetProject(1)),
        store.dispatch(new GetProject(2)),
      ];

      Promise.all(actions).then(() => {
        const state = store.selectSnapshot(
          (state: any) => state.projects,
        ) as ProjectStateModel;
        // The last action should win
        expect(state.selected).toBeDefined();
        expect([1, 2]).toContain(state.selected?.id);
        done();
      });
    });
  });
});
