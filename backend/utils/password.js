// Same rule the frontend enforces on sign up, reset and change password.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";

const isStrongPassword = (password = "") => PASSWORD_REGEX.test(String(password));

module.exports = {
  isStrongPassword,
  PASSWORD_RULE_MESSAGE,
};
