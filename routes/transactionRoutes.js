const express = require("express");
const {
  addTransaction,
  getTransactions,
} = require("../controllers/transactionController");
const { requireSignIn } = require("../controllers/userController");

const router = express.Router();

router.post("/addtransactions", requireSignIn, addTransaction);
router.get("/gettransactions", requireSignIn, getTransactions);

module.exports = router;
