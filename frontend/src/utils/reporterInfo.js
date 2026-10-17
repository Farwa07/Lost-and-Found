import { normalizePhoneNumber } from "./phoneNumber";

export const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();

export const getReporterFieldsFromUser = (currentUser = {}) => {
  const fullName = currentUser?.fullName || currentUser?.name || "";
  const phone = normalizePhoneNumber(currentUser?.phone || currentUser?.contactNumber || "");
  const email = normalizeEmail(currentUser?.email || "");
  const address = currentUser?.address || "";
  const city = currentUser?.city || "";

  return {
    reporterFullName: fullName,
    reporterContactNumber: phone,
    reporterEmail: email,
    reporterAddress: address,
    reporterCity: city,
  };
};

export const applyReporterFields = (state = {}, currentUser = {}) => ({
  ...state,
  ...getReporterFieldsFromUser(currentUser),
});
