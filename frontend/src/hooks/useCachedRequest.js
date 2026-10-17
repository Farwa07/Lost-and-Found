import { useEffect, useState } from "react";

// In-memory cache shared by all pages for this browser tab.
const cache = new Map();

export const clearRequestCache = () => cache.clear();

// Loads data for `key` and remembers it. When the user comes back to a page
// the cached data is shown immediately (so the scroll position can be
// restored) and refreshed quietly in the background.
export default function useCachedRequest(key, fetcher) {
  const [state, setState] = useState(() => ({
    key,
    data: cache.get(key),
    error: "",
    isLoading: !cache.has(key),
  }));
  const [reloadKey, setReloadKey] = useState(0);

  // A different key (e.g. new filters) starts from that key's cache entry.
  if (state.key !== key) {
    setState({ key, data: cache.get(key), error: "", isLoading: !cache.has(key) });
  }

  useEffect(() => {
    let ignore = false;

    fetcher()
      .then((data) => {
        cache.set(key, data);
        if (!ignore) setState({ key, data, error: "", isLoading: false });
      })
      .catch((error) => {
        if (ignore) return;
        setState((previous) => ({
          ...previous,
          // Keep showing cached data if a background refresh fails.
          error: previous.data === undefined ? error.message || "Something went wrong." : "",
          isLoading: false,
        }));
      });

    return () => {
      ignore = true;
    };
    // `fetcher` is recreated on every render; the key describes the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadKey]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    reload: () => {
      setState((previous) => ({ ...previous, error: "", isLoading: previous.data === undefined }));
      setReloadKey((value) => value + 1);
    },
  };
}
