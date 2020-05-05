const mongoose = require("mongoose");
const redis = require("redis");
const client = redis.createClient();
const debug = require('debug')('HOOK_COINS');
const axios = require('axios');


let coinType = ["ERC20", "ERC223", "ERC721", "ERC777"];
const coinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true
  },
  decimals: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: coinType,
    required: true
  },
  minWithdrawal: {
    type: Number,
    default: null
  },
  maxWithdrawal: {
    type: Number,
    required: true
  },
  minAdminBalance: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: new Date()
  }
});

/* POST-HOOK to catch new Coin additions 'save' operations and report to Blockchain Monitoring Service */
coinSchema.post('save', async (data) => {
  debug('COIN HOOK EXECUTED');
  const newCoinData = await mongoose.model('coin', coinSchema).findOne({ symbol: data.symbol });
  client.set(newCoinData.contractAddress, JSON.stringify(newCoinData));
  axios.post(`${process.env.LEX_BM_BASE_URL}/updateCoinAddresses`, {
    coin: newCoinData
  }).then(res => {
      if (res.data.status) debug(`\n**** New Coin (${newCoinData.name} (${newCoinData.symbol})) Created & Sent to Monitoring Service Successfully. ****\n`);
      else debug(`\nERROR!: Coin (${newCoinData.name} (${newCoinData.symbol})) Could Not be registered with Monitoring Service.`);
  }).catch(err => {
    debug('Error Occurred in Post-Hook of Coin Schema', err);
  })
});
  

module.exports = mongoose.model('coin', coinSchema);
