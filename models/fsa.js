const axios = require('axios');
const mongoose = require('mongoose');
const debug = require('debug')('HOOK_ADDRESSES');

const fsaSchema = new mongoose.Schema({
  // tokenName: {
  //   type: String,
  //   default: null
  // },
  // contractAddress: {
  //   type: String,
  //   default: null
  // },
  // tokenSymbol: {
  //   type: String
  // },
  // balance: {
  //   type: String
  // },
  // txHash: {
  //   type: String,
  //   default: null,
  //   unique: true
  // },
  // isTxConfirmed: {
  //     type: Boolean,
  //     default: false
  // },
  // created_At: { type: Date }
  key: {type: String},
  data: {type: JSON}
});

module.exports = mongoose.model('fsa', fsaSchema);
