/**
 * Shared page-name -> route path map for components ported from the old
 * state-based navigation (`onNavigate('some-page')`). Only one dashboard
 * screen exists today, so every role's dashboard token resolves to `/app`;
 * split these out once role-specific dashboards ship.
 */
const PAGE_PATHS: Record<string, string> = {
  home: "/",
  login: "/login",
  register: "/register",
  "register-business": "/register-business",
  "register-customer": "/register-customer",
  "forgot-password": "/forgot-password",
  "verify-code": "/verify-code",
  "verify-email": "/verify-email",
  "customer-dashboard": "/app",
  "business-dashboard": "/app",
  "admin-dashboard": "/app",
  "cac-verification": "/app",
};

export function resolvePagePath(page: string): string {
  return PAGE_PATHS[page] ?? (page.startsWith("/") ? page : "/");
}
