const ContactMessage = require("../models/contactMessage");

// SUBMIT CONTACT MESSAGE
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Name, email, subject and message are required",
      });
    }

    const newMessage = new ContactMessage({
      name,
      email: email.toLowerCase(),
      subject,
      message,
    });

    await newMessage.save();

    res.status(201).json({
      message: "Your message has been sent successfully",
      contactMessage: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN GET ALL CONTACT MESSAGES
const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Contact messages fetched successfully",
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN MARK MESSAGE AS READ
const markContactMessageRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      message: "Contact message marked as read",
      contactMessage: message,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADMIN DELETE CONTACT MESSAGE
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
};