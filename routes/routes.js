const auth = require('../controllers/auth');
const express = require('express');
const address = require('../controllers/address/addressController');
const router = express.Router();

router.use(auth.verify);

/**
 * @description: For requesting a new address
 */
router.get('/getAddress', address.getAddress);

/**
 * @description: Checking the mining/deployment status of a Smart Contract
 */
router.post('/addressStatus', address.checkAddressStatus);

/**
 * @description: Checking the validity of any Ethereum address
 */
router.post('/verifyAddress', address.verifyAddress);

/**
 * @description: Get transaction details
 */
router.get('/transactionDetails', address.getTransactionDetails);

/**
 * @description: Get transaction details
 */
router.post('/listAllDeposits', address.listAllDeposits);

router.get("/", (req, res) => {
  res.send("Welcome to LEX Wallet API Server.");
});

/**
 * @description: For adding a new coin in DB
 */
router.post('/addCoin', address.addCoin);

module.exports = router;