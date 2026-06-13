const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({  
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  city: {
  type: String,
  default: "",
},

address: {
  type: String,
  default: "",
},

bio: {
  type: String,
  default: "",
},

profileImage: {
  type: String,
  default: "",
},

role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
},

status: {
  type: String,
  enum: ["active", "blocked"],
  default: "active",
},

resetOtp: {
    type: String,
    default: "",
  },

  resetOtpExpire: {
    type: Date,
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);