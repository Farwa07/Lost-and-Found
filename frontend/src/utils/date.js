// Today's date as YYYY-MM-DD in the user's local timezone (for <input type="date" max>).
export const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};
