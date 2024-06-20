const express = require("express");
const {
  addIncomeController,
  getIncomeController,
} = require("../controllers/incomeController");
const { requireSignIn } = require("../controllers/userController");

const router = express.Router();

router.post("/add-income", requireSignIn, addIncomeController);
router.get("/get-income", requireSignIn, getIncomeController);

module.exports = router;
