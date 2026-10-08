const mongoose = require("mongoose");

const pendingSignupSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^\+92[0-9]{10}$/, "Phone number must start with +92 and contain exactly 10 digits after it."],
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    otpExpire: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingSignup", pendingSignupSchema);
