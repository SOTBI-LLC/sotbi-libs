import { HttpContextToken } from '@angular/common/http';

/** Keep the current URL when a feature renders its own HTTP 403 state.
 * Authentication, token refresh and the original HTTP error remain unchanged.
 */
export const KEEP_FORBIDDEN_CONTEXT = new HttpContextToken<boolean>(() => false);
