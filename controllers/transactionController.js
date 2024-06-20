const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

const addTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id,
    });
    await transaction.save();

    const user = await User.findById(req.user._id);
    user.transactions.push(transaction);
    await user.save();

    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
};
