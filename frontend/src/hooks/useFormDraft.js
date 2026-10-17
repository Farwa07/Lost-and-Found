import { useCallback, useEffect, useState } from "react";

// Drafts live in memory (so selected File objects survive moving between
// pages) and their text fields also in sessionStorage (so they survive a
// page reload in the same tab).
const memoryDrafts = new Map();
const STORAGE_PREFIX = "lf-draft:";

const readStoredText = (key) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredText = (key, value) => {
  try {
    const textOnly = Object.fromEntries(
      Object.entries(value).filter(([, field]) => !(field instanceof Blob))
    );
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(textOnly));
  } catch {
    // Storage full or blocked: the in-memory draft still works.
  }
};

const removeStored = (key) => {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
};

// Drop-in replacement for useState(initial) on a form. Returns
// [formData, setFormData, clearDraft]; call clearDraft() after a successful
// submit so the next visit starts empty.
export default function useFormDraft(key, initial) {
  const [formData, setFormData] = useState(() => {
    const base = typeof initial === "function" ? initial() : initial;
    if (memoryDrafts.has(key)) return { ...base, ...memoryDrafts.get(key) };
    const stored = readStoredText(key);
    return stored ? { ...base, ...stored } : base;
  });

  useEffect(() => {
    memoryDrafts.set(key, formData);
    writeStoredText(key, formData);
  }, [key, formData]);

  const clearDraft = useCallback(() => {
    memoryDrafts.delete(key);
    removeStored(key);
  }, [key]);

  return [formData, setFormData, clearDraft];
}
