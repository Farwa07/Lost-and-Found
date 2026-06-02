const User = require("../models/user");
const bcrypt = require("bcryptjs");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
};