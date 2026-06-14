const bcrypt = require("bcryptjs");
const User = require("../models/user");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@lostfound.com",
    });

    if (existingAdmin) {
      console.log("Default admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      fullName: "System Admin",
      email: "admin@lostfound.com",
      phone: "03000000000",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("Default admin created successfully");
  } catch (error) {
    console.log("Admin seed error:", error.message);
  }
};

module.exports = seedAdmin;