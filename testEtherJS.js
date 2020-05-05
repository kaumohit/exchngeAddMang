require("dotenv").config();
const debug = require('debug')('ICO');
const ethers = require("ethers");
const provider = ethers.getDefaultProvider('kovan');
//0x599c1d74B9C103Ddb509cCC723d91e56c1C931e8
const wallet = new ethers.Wallet('0xce210e9515d1ec05189c27966e1364ba63f8d93a2bba146ad16dd7232901ef3a', provider);
wallet.getTransactionCount().then(res => {
    debug(res);
});

// provider.getTransactionReceipt('0x53ec3098f9018ee8b9029e1dd71061cd854de6ee3c9f1567495e5adc812e678').then(a =>{
// debug(a);
// }).catch(err => {
//     debug('ERROR: ', err);
// })
