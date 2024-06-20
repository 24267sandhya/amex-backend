const incomeModel = require("../models/incomeModel");

const addIncomeController = async (req, res) => {
  try {
    const { amount, month } = req.body;
    const userId = req.user._id;

    const newIncome = await incomeModel.create({ userId, amount, month });

    res.status(201).send({
      success: true,
      message: "Income added successfully",
      newIncome,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in adding income",
      error,
    });
  }
};

const getIncomeController = async (req, res) => {
  try {
    const userId = req.user._id;
    const incomes = await incomeModel.find({ userId });

    res.status(200).send({
      success: true,
      incomes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching income data",
      error,
    });
  }
};

module.exports = {
  addIncomeController,
  getIncomeController,
};
