const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, number } = req.body;
    const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    message: "Email already exists"
  });
}
    const newUser = new User({ name, email, password, number });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;