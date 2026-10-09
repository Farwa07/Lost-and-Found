const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { isStrongPassword, PASSWORD_RULE_MESSAGE } = require("./password");

// The first admin account is created from environment variables only.
// No credentials are kept in the source code.
const seedAdmin = async () => {
  try {
    const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      // Warn if an old installation still uses the previously hard-coded password.
      if (await bcrypt.compare("Admin@123", existingAdmin.password)) {
        console.log(
          `WARNING: admin ${existingAdmin.email} still uses the old default password. Change it now.`
        );
      }
      return;
    }

    if (!email || !password) {
      console.log(
        "No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one."
      );
      return;
    }

    if (!isStrongPassword(password)) {
      console.log(`ADMIN_PASSWORD rejected: ${PASSWORD_RULE_MESSAGE}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName: process.env.ADMIN_NAME || "System Admin",
      email,
      phone: process.env.ADMIN_PHONE || "+923000000000",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log(`Admin account created for ${email}`);
  } catch (error) {
    console.log("Admin seed error:", error.message);
  }
};

module.exports = seedAdmin;
