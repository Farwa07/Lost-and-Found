import { useSyncExternalStore } from "react";

// "light" | "dark" | "system". The resolved theme is written to
// <html data-theme="..."> and the CSS variables in index.css do the rest.
// index.html applies the saved theme before React loads to avoid a flash.
export const THEME_KEY = "lf-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set();

const readPreference = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};

let preference = readPreference();

const resolve = (value) =>
  value === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : value;

const apply = () => {
  const theme = resolve(preference);
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#0b1220" : "#0ea5e9"
  );
};

export const setThemePreference = (value) => {
  preference = value;
  try {
    if (value === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, value);
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
  apply();
  listeners.forEach((listener) => listener());
};

// Follow the operating system while the preference is "system".
if (typeof window !== "undefined") {
  apply();
  window.matchMedia(DARK_QUERY).addEventListener("change", () => {
    if (preference === "system") apply();
  });
}

export const useThemePreference = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => preference
  );
