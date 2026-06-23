const User = require("../models/user");
const PendingSignup = require("../models/pendingSignup");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Report = require("../models/report");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const ReportComplaint = require("../models/reportComplaint");
const ReportMatch = require("../models/reportMatch");


// Email sender setup
const sendEmail = async (to, subject, text) => {
  try {
    const cleanTo = String(to).trim().toLowerCase();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Lost and Found" <${process.env.EMAIL_USER}>`,
      to: cleanTo,
      subject,
      text,
    });

    console.log("Email sent successfully");

    return info;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};
// SEND SIGNUP OTP
const sendSignupOtp = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const hashedPassword = await bcrypt.hash(password, 10);

    await PendingSignup.findOneAndDelete({ email: cleanEmail });

    const pendingSignup = new PendingSignup({
      fullName,
      email: cleanEmail,
      phone,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000,
    });

    await pendingSignup.save();

 await sendEmail(
  cleanEmail,
  "Verification code",
  `Your verification code is ${otp}

Use this code to verify your Lost and Found account.

This code will expire in 5 minutes.`
);

    res.status(200).json({
      message: "OTP sent to your email successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY SIGNUP OTP
const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.toLowerCase();

    const pendingSignup = await PendingSignup.findOne({
      email: cleanEmail,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!pendingSignup) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const newUser = new User({
      fullName: pendingSignup.fullName,
      email: pendingSignup.email,
      phone: pendingSignup.phone,
      password: pendingSignup.password,
      status: "active",
    });

    await newUser.save();

    await PendingSignup.findOneAndDelete({ email: cleanEmail });

    res.status(201).json({
      message: "Account verified and registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REGISTER USER - old direct signup, optional
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: cleanEmail,
      phone,
      password: hashedPassword,
      status: "active",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// FORGOT PASSWORD - SEND RESET LINK
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked by admin",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendEmail(
  user.email,
  "Password Reset Request",
  `Password Reset Request

You requested to reset your password.

Click the link below to reset your password:
${resetUrl}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.`
);

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// RESET PASSWORD USING RESET LINK TOKEN
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetOtp -resetOtpExpire"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "phone",
      "city",
      "address",
      "bio",
      "profileImage",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -resetOtp -resetOtpExpire");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE MY ACCOUNT
// DELETE MY ACCOUNT
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin account cannot be deleted from settings.",
      });
    }

    const userReports = await Report.find({ userId }).select("_id");
    const userReportIds = userReports.map((report) => report._id);

    if (userReportIds.length > 0) {
      await Comment.deleteMany({
        reportId: { $in: userReportIds },
      });

      await Notification.deleteMany({
        $or: [
          { userId },
          { reportId: { $in: userReportIds } },
        ],
      });

      await ReportComplaint.deleteMany({
        reportId: { $in: userReportIds },
      });

      await ReportMatch.deleteMany({
        $or: [
          { lostReportId: { $in: userReportIds } },
          { foundReportId: { $in: userReportIds } },
        ],
      });

      await Report.deleteMany({
        _id: { $in: userReportIds },
      });
    }

    await Comment.deleteMany({ userId });
    await Notification.deleteMany({ userId });
    await ReportComplaint.deleteMany({ reportedBy: userId });

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Account and related reports deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete account.",
    });
  }
};

// UPDATE PROFILE IMAGE
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const imagePath = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imagePath },
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpire");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: imagePath,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  deleteMyAccount,
  sendSignupOtp,
  verifySignupOtp,
  getProfile,
  updateProfile,
  changePassword,
  updateProfileImage,
};