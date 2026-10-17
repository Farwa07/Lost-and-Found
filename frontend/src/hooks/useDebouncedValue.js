import { useEffect, useState } from "react";

// Returns `value` only after it has stopped changing for `delay` ms, so typing
// in a search box triggers one request instead of one per key press.
export default function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
