const ContactMessage = require("../models/contactMessage");
const nodemailer = require("nodemailer");

const sendContactEmail = async (contactMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Lost & Found Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
    replyTo: contactMessage.email,
    subject: `New Contact Message: ${contactMessage.subject}`,
    text: `
New contact message received.

Name: ${contactMessage.name}
Email: ${contactMessage.email}
Subject: ${contactMessage.subject}

Message:
${contactMessage.message}
    `,
  });
};

// SUBMIT CONTACT MESSAGE
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Same message ko 2 minutes ke andar duplicate save/email hone se roko
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const existingMessage = await ContactMessage.findOne({
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existingMessage) {
      return res.status(200).json({
        message: "Your message has already been submitted. Please wait for admin response.",
        duplicate: true,
        contactMessage: existingMessage,
      });
    }

    const newMessage = new ContactMessage({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    await newMessage.save();

    // Frontend ko foran response bhej do, email background mein send hogi
    res.status(201).json({
      message: "Your message has been sent successfully",
      contactMessage: newMessage,
    });

    sendContactEmail(newMessage).catch((emailError) => {
      console.error("Contact email failed:", emailError.message);
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to send contact message",
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