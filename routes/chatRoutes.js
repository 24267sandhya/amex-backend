const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Get chat messages
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Chat.find({ chatId: req.params.chatId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post chat message
router.post("/", async (req, res) => {
  const chatMessage = new Chat({
    chatId: req.body.chatId,
    sender: req.body.sender,
    message: req.body.message,
  });

  try {
    const newMessage = await chatMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
