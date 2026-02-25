import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { ICellRendererParams } from 'ag-grid-community';
import { UserWithAvatarComponent } from './user-with-avatar.component';

describe('UserWithAvatarComponent', () => {
  let component: UserWithAvatarComponent;
  let fixture: ComponentFixture<UserWithAvatarComponent>;

  const getUser = (comp: UserWithAvatarComponent): string | null =>
    (comp as unknown as { user: () => string | null }).user();
  const getAvatar = (comp: UserWithAvatarComponent): string | null =>
    (comp as unknown as { avatar: () => string | null }).avatar();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWithAvatarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserWithAvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('agInit', () => {
    it('should set user and avatar from params', () => {
      const params = {
        user: 'John Doe',
        avatar: 'https://example.com/avatar.png',
      } as unknown as ICellRendererParams;

      component.agInit(params);
      fixture.detectChanges();

      expect(getUser(component)).toBe('John Doe');
      expect(getAvatar(component)).toBe('https://example.com/avatar.png');
    });

    it('should use defaults when params missing', () => {
      component.agInit({} as ICellRendererParams);
      fixture.detectChanges();

      expect(getUser(component)).toBe('Guest');
      expect(getAvatar(component)).toBeNull();
    });
  });

  describe('getValue', () => {
    it('should return user string', () => {
      component.agInit({
        user: 'Jane Smith',
      } as unknown as ICellRendererParams);
      fixture.detectChanges();

      expect(component.getValue()).toBe('Jane Smith');
    });
  });

  describe('refresh', () => {
    it('should return true', () => {
      expect(component.refresh()).toBe(true);
    });
  });

  describe('template', () => {
    it('should render user name in template', () => {
      component.agInit({ user: 'Alice' } as unknown as ICellRendererParams);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alice');
    });
  });
});
