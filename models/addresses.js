const axios = require('axios');
const mongoose = require('mongoose');
const debug = require('debug')('HOOK_ADDRESSES');

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    default: null
  },
  fees: {
    type: Number,
    default: null,
    required: true
  },
  txnHash: {
    type: String,
    required: true,
    unique: true
  },
  parentContract: {
    type: String,
    required: true  
  },
  allocation_Date: {
    type: Date,
    default: null
  },
  isAllocated: {
    type: Boolean,
    default: false
  },
  created_At: { type: Date, required: true },
  updated_At: { type: Date, default: null }
});

/* POST-HOOK to catch user deposit address 'findOneAndUpdate' operations and report to Blockchain Monitoring Service */
addressSchema.post('findOneAndUpdate', async (data) => {
const newAddressData = await mongoose.model('addresses', addressSchema).findOne({txnHash: data.txnHash});
if (newAddressData.isAllocated) {
  axios
    .post(`${process.env.LEX_BM_BASE_URL}/updateAllocatedAddresses`, {
      address: newAddressData.address
    })
    .then(res => {
      if (res.data.status)
        debug(
          `\n**** New Address (${
            newAddressData.address
          }) Allocated & Sent to Monitoring Service Successfully. ****\n`
        );
      else
        debug(
          `\nERROR!: Address (${
            newAddressData.address
          }) Could Not be registered with Monitoring Service.`
        );
    })
    .catch(err => {
      debug("Error Occurred in Post-Hook of Address Schema", err);
    });
} else {}
});

module.exports = mongoose.model('addresses', addressSchema);
