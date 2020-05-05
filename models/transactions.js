const mongoose = require("mongoose");
const TxnSchema = new mongoose.Schema({
  txID: String,
  txHashSubmit: {
    type: String
  },
  txHashConfirm: {
    type: String
  },
  requestCount: {
    type: Number,
    default: 0
  },
  statusConfirm: {
    type: Number,
    enum: [1, 0, -1]
  },
  createdAtSubmit: {
    type: Date,
    // default: new Date()
  },
  updatedAtSubmit: {
    type: Date,
    // default: new Date()
  },
  createdAtConfirm: {
    type: Date,
    // default: new Date()
  },
  updatedAtConfirm: {
    type: Date,
    // default: new Date()
  },
  statusSubmit: {
    type: Number,
    enum: [1, 0, -1]
  },
  txnHash: {
    type: String
  },
  from: String,
  to: String,
  blockNumber: Number,
  value: Number,
  type: {
    type: String,
    enum: ['DEPOSIT','WITHDRAWAL']
  },
  coin: String,
  isUserNotified: {
    type: Boolean,
    default: false
  },
  isWithdrawalConfirmed: {
    type: Boolean,
    default: false
  },
  memo: { type: String, default: null },
  status: {
    type: Number,
    enum: [1, 0, -1]
  },
  isMoved : {
    type : Boolean,
    default : false
  },
  ERC20DrainHash: {
      type : String,
      default : null
  },
  isERC20DrainMined: {
    type : Boolean,
    default : false
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model("transaction", TxnSchema);