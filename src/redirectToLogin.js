import { constant } from "./const";

let redirecting = false;

/** Skip redirect for auth endpoints (e.g. wrong password should not log the user out). */
export function isAuthLoginRequestUrl(url) {
  const s = String(url || "");
  return /admin-login/i.test(s) || /\/admin\/\s*admin-login/i.test(s);
}

/**
 * Clears admin session and navigates to the login screen.
 * The app’s login route is `/${constant.adminRoute}`, not a literal `/login`.
 */
export function redirectToLogin() {
  if (redirecting) return;
  redirecting = true;
  try {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
  } catch (_) {
    /* ignore */
  }
  const path = (constant?.adminRoute || "").toString().replace(/^\/+/, "");
  const target = `/${path}`.replace(/\/+/g, "/");
  window.location.replace(target || "/");
}
