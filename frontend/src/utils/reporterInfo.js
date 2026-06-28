export const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();

export const getReporterFieldsFromUser = (currentUser = {}) => {
  const fullName = currentUser?.fullName || currentUser?.name || "";
  const phone = currentUser?.phone || currentUser?.contactNumber || "";
  const email = normalizeEmail(currentUser?.email || "");
  const address = currentUser?.address || currentUser?.city || "";

  return {
    reporterFullName: fullName,
    reporterContactNumber: phone,
    reporterEmail: email,
    reporterAddress: address,
  };
};

export const applyReporterFields = (state = {}, currentUser = {}) => ({
  ...state,
  ...getReporterFieldsFromUser(currentUser),
});
