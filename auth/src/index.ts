import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './lib/interceptors/auth.interceptor';

export { AuthService } from './lib/auth.service';
export {
  CanComponentDeactivate,
  deactivateGuard,
} from './lib/deactivate.guard';
export { UploadInterceptor } from './lib/interceptors/upload.interceptor';
export { canActivateChildGuard } from './lib/role-guard/can-activate-child.guard';
export { canActivateGuard } from './lib/role-guard/can-activate.guard';
export { canMatchGuard } from './lib/role-guard/can-match.guard';
export {
  GetAccess,
  Login,
  LoginAs,
  Logout,
  RefreshToken,
  Restore,
  UpdateMe,
} from './lib/store/auth.actions';
export { AuthState, AuthStateModel, SotbiClaims } from './lib/store/auth.state';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
