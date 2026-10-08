export const normalizePhoneNumber = (value = "") => {
  let digits = String(value).replace(/\D/g, "");
  if (digits.startsWith("92")) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return `+92${digits.slice(0, 10)}`;
};

export const isValidPhoneNumber = (value = "") =>
  /^\+92[0-9]{10}$/.test(String(value).trim());
