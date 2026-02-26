import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { ICellRendererParams } from 'ag-grid-community';
import { UserWithAvatarComponent } from './user-with-avatar.component';

describe('UserWithAvatarComponent', () => {
  let component: UserWithAvatarComponent;
  let fixture: ComponentFixture<UserWithAvatarComponent>;

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

      expect(component.user).toBe('John Doe');
      expect(component.avatar).toBe('https://example.com/avatar.png');
    });

    it('should use defaults when params missing', () => {
      component.agInit({} as ICellRendererParams);
      fixture.detectChanges();

      expect(component.user).toBe('Guest');
      expect(component.avatar).toBeNull();
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
