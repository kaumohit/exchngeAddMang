require("dotenv").config();
require("./config/db");
const ethers = require("ethers");
const config = require("./config/appConfig");
// const ABI = [
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "token",
// 				"type": "address"
// 			},
// 			{
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "drainTokens20",
// 		"outputs": [],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "drainEthersManually",
// 		"outputs": [],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "_from",
// 				"type": "address"
// 			},
// 			{
// 				"name": "_value",
// 				"type": "uint256"
// 			},
// 			{
// 				"name": "_data",
// 				"type": "bytes32"
// 			}
// 		],
// 		"name": "tokenFallback",
// 		"outputs": [],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "token",
// 				"type": "address"
// 			},
// 			{
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "drainTokens223",
// 		"outputs": [],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "getEtherBalance",
// 		"outputs": [
// 			{
// 				"name": "balance",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"name": "masterContrAddr",
// 				"type": "address"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "constructor"
// 	},
// 	{
// 		"payable": true,
// 		"stateMutability": "payable",
// 		"type": "fallback"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"name": "account",
// 				"type": "address"
// 			}
// 		],
// 		"name": "AccountCreated",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"name": "account",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "amount",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "totalBalance",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "EtherDeposited",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"name": "account",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "token",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "amount",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "totalBalance",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "TokenDrained",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"name": "account",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "amount",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "totalBalance",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "EtherDrained",
// 		"type": "event"
// 	}
// ];
const ABI = require('./config/abiConfig.json')
const provider = ethers.getDefaultProvider(config.NETWORK);
// const wallet = new ethers.Wallet(config.PRIV_KEY_MAP['0x07B99Ab633C32607B56c167BC8296f3381a7B67f'], provider);
const axios = require('axios')

let contract = new ethers.Contract(
  /* config.FACTORY_CONTRACT_ADDRESS */'0x009e6ee193a2cc72214f37e2ed101e121f57f610',
  ABI,
  provider
);


// for (let add of CONTRACT_ARRAY){
//     await setTimeout(async ()=> {
//       const data = await axios.get(`http://api.ethplorer.io/getAddressInfo/${add}?apiKey=freekey`);
//       if (Number(data.data.ETH.balance) > 0 || data.data.tokens) {
//         console.log(add);
//       };
//     }, 2000);
    
const sleep = (ms)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// }
let count = 919;
const getBalance = async (count) => {
  if ((count > 0 || count == 0) && count < CONTRACT_ARRAY.length) {
    console.log("Count: ", count,/*   'LEN: ',CONTRACT_ARRAY.length */);
    console.log(CONTRACT_ARRAY[count]);
    try {
    // return new Promise(async (resolve, reject) => {
      await sleep(3000);
      const data = await axios.get(
        `http://api.ethplorer.io/getAddressInfo/${
          CONTRACT_ARRAY[count]
        }?apiKey=freekey`
      );
      // if (Number(data.data.ETH.balance) > 0 || data.data.tokens) {
      // console.log('\nFOUND ONE: ', CONTRACT_ARRAY[count]);
      // console.log("DATA: ", data.data);
      console.log({ ETH: data.data.ETH.balance, ERC: data.data.tokens });
      if (data.data.ETH.balance > 0 || data.data.tokens) process.exit(1);
      console.log("***************************************************\n");
      // } else resolve ('Nothing');
      console.log("DONE");
      --count;
      getBalance(count);
    // });
      } catch (err) {
        console.log(err.data);
        getBalance(count);
      }
  } else {
    console.log("FINISHED!");
    process.exit(1);
  }
};
getBalance(count);


// (async ()=> {
//   // if (count > 0 || count == 0){
//     const a = await getBalance(count);
//     // console.log('BAL: ', a.ETH, 'ERC: ', a.ERC);
//   ++count;
//   getBalance(count);
// // } else {
// //   process.exit(1);
// // }
// })();
// let count;
// setInterval(async (count = 0) => {
//   console.log('VAL: ', count);
  
// }, 5000)


// console.log(config.NETWORK);
// console.log(contract);
// (async () => {
//   const owner = await contract.owner();
//   const wallet = new ethers.Wallet(config.PRIV_KEY_MAP[owner], provider);
//   const count = await wallet.getTransactionCount();
//   console.log("COUNT: ", count);
// })();


// const jwt = require('jsonwebtoken');
// const uuidv4 = require('uuid/v4');
// const secret = uuidv4();
// const token = jwt.sign({
//     // exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, /* 60 * 60 * 24 * 30 Seconds == 1 Month*/
// }, 'MXYhtHVMl1vuflOtUWOJHbpUokdYBoab9Zgru13FQmZWxEdgoPPVQ3E5dHRCTPDS');

// console.log(token);
// // console.log(secret);
// const tok = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjAwMTE0ODYsImlhdCI6MTU1NzQxOTQ4Nn0.81bo8lS-vTcVb8x704GbNUV-Uhmp9FTZ3cyqtMgh6KE';

// jwt.verify(tok, process.env.JWT_SECRET, (err, decoded) => {
//     if (!err) console.log(decoded);
//     else console.log('ERROR: ', err);
// })

// const a = [
//   {
//     txnHash:
//       "0x2f27ea26c24dc4bdc8e559a679297ef0b2afc30dce895fff02655ecd541b812d",
//     from: "0x599c1d74B9C103Ddb509cCC723d91e56c1C931e8",
//     to: "0xAE27375f12d10e86488c3eB401b32701a24f9e1e",
//     value: 0.001,
//     coin: "ETH",
//     type: "DEPOSIT",
//     isMined: true,
//     timestamp: 1557901114248
//   },
//   {
//     txnHash:
//       "0xc26b574ba8df91658bcc326021996b9a5fc78f812f13be2a9a9ec7d8055a65bc",
//     from: "0x07B99Ab633C32607B56c167BC8296f3381a7B67f",
//     to: "0xAE27375f12d10e86488c3eB401b32701a24f9e1e",
//     value: 0.001,
//     coin: "ETH",
//     type: "DEPOSIT",
//     isMined: true,
//     timestamp: 1557988499417
//   },
//   {
//     a: "TEST 1"
//   },
//   {
//     a: "TEST 2"
//   }
// ];
// a.splice(2);
// console.log(a);

// const TR = require("./models/withdrawal");
// const TR2 = require("./models/withdrawal2");
// const toUTC = date => {
//   let now = new Date(date);
//   let nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
//   return nowUtc; /* .getTime(); */
// };
// // (async () => {
// // FROM:  1556649000000
// // TO:  1558377000000
// //   const from = toUTC(new Date("2019-05-01T00:00:00.000Z"));/* .getTime(); */
// //   const to = toUTC(new Date("2019-05-21T00:00:00.000Z"));/* .getTime(); */
// //   console.log('FROM: ', from, '\nTO: ', to);
// // const a = await TR.find({
// //     createdAt: {
// //       $lte: toUTC(new Date('2019-05-16T00:00:00.000Z')) /* + 86399999 */,
// //       $gte: toUTC(new Date('2019-05-15T00:00:00.000Z'))
// //     },
// //     // coin: coin || { $ne: null }
// //   }).count();
// //   console.log(a);
// // })();
// // "type":"WITHDRAWAL",

// // db.find().forEach(function(doc){
// //   db.collection1.insert(doc); // start to replace
// // });
// // let arr = [];
// TR.find({}, (err, res) => {
//   if (err) console.log(err);
//   else {
//     arr.push(res);
//     // console.log(arr[0].length);
   
//     arr[0].forEach(element => {
//       // console.log(tx);
//       element.type = "WITHDRAWAL";
//     });
//       // }
//     console.log('**********************************************************\n\n\n\n\n\n\n\n');
//     console.log(arr[0]);

//   }
// });
// var arrOfObj = [{
//   name: 'eve'
// }, {
//   name: 'john'
// }, {
//   name: 'jane'
// }];

// var result = arrOfObj.map((el) => {
//   var o = Object.assign({}, el);
//   o.isActive = true;
//   return o;
// })

// console.log(arrOfObj);
// console.log(result);
