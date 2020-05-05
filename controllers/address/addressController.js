require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");
const utils = require("../utils");
const ADDRESSES = require("../../models/addresses");
const COINS = require("../../models/coins");
const isHex = require("is-hex");
const stripHexPrefix = require("strip-hex-prefix");
const debug = require("debug")("ADDR_CONTR");
const redis = require("redis");
const client = redis.createClient();

/**
 * @description: Function to request new address.
 * @param {string} userID: userID/identifier of the user of LEX Exchange.
 */
exports.getAddress = async (req, res) => {
  try {
    const [newAddress] = await Promise.all([
      ADDRESSES.findOne({
        isAllocated: false,
        address: { $ne: null },
        allocated_To: null
      }).sort({ created_At: 1 })
    ]);
    if (!newAddress) {
      client.get("addressGenerationStatus", async (err, cronStatus) => {
        if (cronStatus == "false") {
          debug(`Out of New Addresses to Assign, executing API...`);
          await utils.generateAddresses(1, req, res);
        } else {
          res
            .status(400)
            .json({ errorCode: "011", msg: "No free addresses available" });
        }
      });
    } else {
      ADDRESSES.findOneAndUpdate(
        { address: newAddress.address },
        {
          isAllocated: true,
          allocation_Date: new Date(),
          updated_At: new Date()
        },
        { useFindAndModify: false }
      )
        .then(() => {
          res.status(200).json({
            hash: newAddress.txnHash,
            address: newAddress.address
          });
        })
        .catch(err => {
          debug(
            `Error in Updating new address assigned status, /addressController: ${err}`
          );
          res.status(400).json({
            errorCode: "006",
            msg: "Something Went Wrong."
          });
        });
    }
  } catch (err) {
    debug(`Something Went Wrong Inside /getAddress API, ${err}`);
    res.status(400).json({
      errorCode: "006",
      msg: "Something Went Wrong."
    });
  }
};

/**
 * @description: To check the mining/deployment status of a Smart Contract(SC).
 * @param {string} hash: hash of the transaction.
 */
exports.checkAddressStatus = async (req, res) => {
  const { hash } = req.body;
  const txn = await ADDRESSES.find({ txnHash: hash });
  if (txn.length == 0)
    return res.status(400).json({
      errorCode: "009",
      msg: "Invalid Transaction Hash"
    });
  else {
    const address = txn[0].address ? txn[0].address : null;
    if (address)
      return res.status(200).json({
        txnHash: txn[0].txnHash,
        address: address,
        isMined: true,
        isAllocated: txn[0].isAllocated
      });
    else
      return res.status(200).json({
        hash: txn[0].txnHash,
        address: address,
        isMined: false,
        isAllocated: "N/A"
      });
  }
};

/**
 * @description: Get transaction details via hash.
 * @param {string} hash: hash of the transaction.
 */
exports.getTransactionDetails = async (req, res) => {
  req
    .checkQuery("txHash")
    .exists()
    .withMessage("tx hash element must be present")
    .notEmpty()
    .withMessage("tx hash can't be empty")
    .custom(hash => {
      if (isHex(stripHexPrefix(hash)) && hash.length === 66) {
        return true;
      }
    })
    .withMessage("tx hash must be in valid format");
  req
    .checkQuery("type")
    .trim()
    .notEmpty()
    .withMessage("'type' field cannot be empty")
    .isIn(["DEPOSIT", "WITHDRAWAL"]);

  if (req.validationErrors())
    res
      .status(400)
      .json({ errorCode: "003", msg: req.validationErrors()[0].msg });
  else utils.getTransactionDetails(req, res);
};

/**
 * @description: Get transaction details via hash.
 * @param {string} hash: hash of the transaction.
 */
exports.listAllDeposits = async (req, res) => {
  req
    .check("fromDate", "fromDate value is Invalid.")
    .trim()
    .exists()
    .withMessage("fromDate is a required field")
    .custom(date => {
      if (date) {
        return true;
      }
    })
    .withMessage("fromDate cannot be left empty.");
  req
    .check("toDate", "toDate value is Invalid.")
    .trim()
    .exists()
    .withMessage("toDate is a required field")
    .custom(date => {
      if (date) {
        return true;
      }
    })
    .withMessage("toDate cannot be left empty.");
  if (req.body.pageNum)
    req
      .check("pageNum", "pageNum value is Invalid.")
      .trim()
      .isInt({ gt: -1 });
  if (req.validationErrors())
    res
      .status(400)
      .json({ errorCode: "003", msg: req.validationErrors()[0].msg });
  else utils.listAllDeposits(req, res);
};

/**
 * @description: To check the validity of a User's Ethereum Address.
 * @param {string} hash: hash of the transaction.
 */
exports.verifyAddress = async (req, res) => {
  const { address } = req.body;
  try {
    const prom = await Promise.all([
      ADDRESSES.find({ address: address }),
      ethers.utils.getAddress(address)
    ]);
    if (prom[0].length !== 0 && prom[1] == address)
      return res.status(200).json({
        isVerified: true,
        msg: "The Address is genuine"
      });
    /* When address is genuine but not pressent in our DB */ else
      return res.status(400).json({
        errorCode: "007",
        msg: "Sorry, the address is NOT genuine"
      });
  } catch (err) {
    if (err.code == "INVALID_ARGUMENT")
      /* When address is NOT genuine on Ethereum */

      return res.status(400).json({
        errorCode: "008",
        msg: "Sorry, the address is NOT genuine"
      });
    else
      return res.status(400).json({
        errorCode: "006",
        msg: "Something Went Wrong"
      });
  }
};

/**
 * @description: To add a new coin for support.
 * @param {string} name: Name of the coin to be added.
 * @param {string} symbol: Symbol of the coin to be added.
 * @param {string} contractAddress: Ethereum Address Coin's Smart Contract.
 * @param {string} type: Type of Coin.
 * @param {number} decimals: Decimal places of the coin .
 * @param {number} maxWithdrawal: Maximum Withdrawal Amount for this coin.
 * @param {number} minAdminBalance: Minimum Balance to be maintained by the ADMIN for this coin.
 */
exports.addCoin = async (req, res) => {
  try {
    req
      .check("name", "Name of the Coin must be mentioned.")
      .trim()
      .isLength({ min: 2, max: undefined });
    req
      .check("symbol", "Symbol of the Coin must be mentioned.")
      .isLength({ min: 2, max: undefined });
    req
      .check("decimals", "Please Enter Correct Decimal Amount (0<=18).")
      .exists()
      .isInt({ gt: 0, lt: 19 });
    req
      .check("type", `${req.body.type} is an Invalid Coin Type .`)
      .isIn(["ERC20", "ERC223", "ERC721", "ERC777"]);
    req
      .check("maxWithdrawal", "Please Enter Correct Max Withdrawal Amount.")
      .exists()
      .isInt();
    req
      .check("minAdminBalance", "Please Enter Correct Max Withdrawal Amount.")
      .exists()
      .isInt();

    const error = req.validationErrors();
    if (error)
      return res.status(400).json({ errorCode: "003", msg: error[0].msg });

    let prom;
    try {
      prom = await Promise.all([
        COINS.find({ contractAddress: req.body.contractAddress }),
        ethers.utils.getAddress(req.body.contractAddress)
      ]);
      if (prom[0].length > 0)
        res.status(400).json({
          errorCode: "004",
          msg: "Coin is already added to the system."
        });
      const {
        name,
        symbol,
        contractAddress,
        decimals,
        type,
        maxWithdrawal,
        minAdminBalance
      } = req.body;
      const data = {
        name: name,
        symbol: symbol.toUpperCase(),
        contractAddress: contractAddress,
        decimals: decimals,
        type: type,
        minAdminBalance: minAdminBalance,
        maxWithdrawal: maxWithdrawal,
        updatedAt: new Date()
      };
      const coinsData = new COINS(data);
      await coinsData.save(coinsData);
      res.status(200).json({
        msg: "Coin Added Successfully",
        data: data
      });
    } catch (err) {
      if (err.code == "INVALID_ARGUMENT")
        res.status(400).json({
          errorCode: "005",
          msg: "Contract Address is Invalid. Please Check."
        });
      else {
        debug(`Error inside addCoin API: ${err}`);
        res
          .status(400)
          .json({ errorCode: "010", msg: "Something Went Wrong." });
      }
    }
  } catch (er) {
    //console.log(er);
    res.status(400).json({ errorCode: "005", msg: "Invalid Contract Address" });
  }
};
