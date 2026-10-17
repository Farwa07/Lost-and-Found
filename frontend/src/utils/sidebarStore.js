import { useSyncExternalStore } from "react";

// Shared open/closed state for the sidebar so the Navbar menu button and the
// Sidebar stay in sync on every page without each page holding its own state.
// Desktop starts open; mobile starts closed and closes again on navigation.
export const MOBILE_QUERY = "(max-width: 900px)";

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

let open = !isMobile();
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const setSidebarOpen = (value) => {
  const next = typeof value === "function" ? value(open) : Boolean(value);
  if (next === open) return;
  open = next;
  emit();
};

export const toggleSidebar = () => setSidebarOpen((prev) => !prev);

export const closeSidebarOnMobile = () => {
  if (isMobile()) setSidebarOpen(false);
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSidebarOpen = () => useSyncExternalStore(subscribe, () => open);

export const useIsMobile = () =>
  useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(MOBILE_QUERY);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    isMobile
  );
