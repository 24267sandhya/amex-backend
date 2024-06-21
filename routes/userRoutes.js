const express = require("express");
const {
  registerController,
  loginController,
  updateUserController,
  getUserQrCode,
  requireSignIn,
  saveCardDetails,
  processPayment,
  getCards,
  saveUserDetails,
  checkUserDetails,
  verifyPassword, 
  buyStock,
  sellStock,
  getUserPurchasedStocks,
  buyFund,
  getUserFunds,
  sellFund,
  getRewardPoints,
} = require("../controllers/userController");

// router object
const router = express.Router();

// routes
// REGISTER || POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

// UPDATE || PUT
router.put('/update-user', requireSignIn, updateUserController);

// Get User QR Code
router.get('/qrcode/:userId', getUserQrCode);

// Save Card Details
router.post('/save-card', requireSignIn, saveCardDetails);

// Process Payment
router.post('/process-payment', requireSignIn, processPayment);

// Get Saved Cards
router.get('/get-cards', requireSignIn, getCards);

// Save User Details
router.post('/save-details', requireSignIn, saveUserDetails);

// Check User Details
router.get('/check-details', requireSignIn, checkUserDetails);

router.post('/verify-password', requireSignIn, verifyPassword);

router.post('/stocks/buy', requireSignIn, buyStock);

router.post('/funds/buy', requireSignIn, buyFund);

router.get('/get-funds', requireSignIn, getUserFunds);

router.post('/funds/sell', requireSignIn, sellFund);

// Get user's purchased stocks
router.get('/stocks/purchased', requireSignIn, getUserPurchasedStocks);

router.post('/stocks/sell', requireSignIn, sellStock);

router.get('/reward-points', requireSignIn, getRewardPoints);


// export
module.exports = router;