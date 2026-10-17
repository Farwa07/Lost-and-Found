// App-wide notifications. <Toaster /> and <ConfirmDialogHost /> (mounted once
// in App.jsx) listen for these events and render the UI.
export const TOAST_EVENT = "app:toast";
export const CONFIRM_EVENT = "app:confirm";

const ERROR_WORDS =
  /\b(unable|failed|fail|error|invalid|cannot|can't|not allowed|required|please|missing|wrong|expired|denied)\b/i;
const SUCCESS_WORDS =
  /\b(success|successfully|saved|updated|deleted|sent|copied|submitted|created|reported|removed|verified)\b/i;

const guessType = (message) => {
  if (ERROR_WORDS.test(message)) return "error";
  if (SUCCESS_WORDS.test(message)) return "success";
  return "info";
};

// Non-blocking replacement for window.alert(). The type is guessed from the
// message when not given: toast("Saved successfully") shows a success toast.
export const toast = (message, type) => {
  const text = String(message ?? "");
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { text, type: type || guessType(text) } })
  );
};

toast.success = (message) => toast(message, "success");
toast.error = (message) => toast(message, "error");
toast.info = (message) => toast(message, "info");

// Promise based replacement for window.confirm():
//   if (!(await confirmDialog("Delete this report?"))) return;
export const confirmDialog = (message, options = {}) =>
  new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(CONFIRM_EVENT, {
        detail: {
          message: String(message ?? ""),
          title: options.title || "Are you sure?",
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          danger: options.danger ?? true,
          resolve,
        },
      })
    );
  });
