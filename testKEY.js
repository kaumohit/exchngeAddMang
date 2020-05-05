require("dotenv").config();
require("./config/db");
const ethers = require("ethers");
const COINS = require("./models/coins");
const config = require("./config/appConfig");
// const Web3 = require("web3");
// web3 = new Web3(new Web3.providers.HttpProvider(process.env.URL_ETH));
// console.log('WEB3: ', web3.currentProvider);

// const providerWEB3 = new ethers.providers.Web3Provider(web3.currentProvider);
// console.log('PROV: ', providerWEB3);

const ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "tokenOwner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address"
      },
      {
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "tokens",
        type: "uint256"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "approveAndCall",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "newOwner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "tokenAddress",
        type: "address"
      },
      {
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "transferAnyERC20Token",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "tokenOwner",
        type: "address"
      },
      {
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        name: "remaining",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "tokenOwner",
        type: "address"
      },
      {
        indexed: true,
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        name: "tokens",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  }
];
// const axios = require('axios')
let etherscanProvider = new ethers.providers.EtherscanProvider("kovan");


// etherscanProvider.getHistory('0xE87B970bfFD4bABbE6794470F97c1E62086A4CE6', null, 'latest').then((history) => {

//     history.forEach((tx) => {
//         console.log(tx);
//     })
// });
// provider.getHistory('0xAAbf093BB1Bc9E924C3e8DeDC850f559decbebc1').then((history) => {
//     history.forEach((tx) => {
//         console.log(tx);
//     })
// });
// let topic = ethers.utils.id("Transfer(bytes32,address,uint256)");
// let filter = {
//     address: '0xB9838E78FdB9BD5b86f15349710bf929e85B66F4',
//     // fromBlock: 3313425,
//     // toBlock: 3313430,
//     // topics: [ topic ]
// }

// provider.getLogs(filter).then((result) => {
//     console.log(result);
//     console.log('*****************************\n');
//     // [ {
//     //    blockNumber: 3313426,
//     //    blockHash: "0xe01c1e437ed3af9061006492cb07454eca8561479454a709809b7897f225387d",
//     //    transactionIndex: 5,
//     //    removed: false,
//     //    address: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c",
//     //    data: "0x00000000000000000000000053095760c154a1531a69fc718119d14c4aa1506f" +
//     //            "000000000000000000000000000000000000000000000000016345785d8a0000",
//     //    topics: [
//     //      "0x179ef3319e6587f6efd3157b34c8b357141528074bcb03f9903589876168fa14",
//     //      "0xe625ed7b108857745d1d9889a7ae05861d8aee38e0e92fd3a31191de01c2515b"
//     //    ],
//     //    transactionHash: "0x61d641aaf3dcf4cf6bafc3e79d332d8773ea0688f87eb00f8b60c3f0050e55f0",
//     //    logIndex: 5
//     // } ]

// });
// provider.on('0xaabf093bb1bc9e924c3e8dedc850f559decbebc1', (blockNumber) => {
//     console.log('New Block: ' + blockNumber);
// });

/* { blockNumber: 11072880,
  blockHash: '0x4c58d233ae382242aa32f1539388f4455b86d7b30423a43cd093a26005bec500',
  transactionIndex: 0,
  removed: false,
  address: '0xB9838E78FdB9BD5b86f15349710bf929e85B66F4',
  data: '0x0000000000000000000000000000000000000000000000000000000000000001',
  topics: 
   [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
     '0x000000000000000000000000e87b970bffd4babbe6794470f97c1e62086a4ce6',
     '0x000000000000000000000000aabf093bb1bc9e924c3e8dedc850f559decbebc1' ],
  transactionHash: '0x7a7c5eac1d2a2b51bf312814112db4bc8d5a8143c4e6df69c88da67df9e6bb30',
  logIndex: 0,
  args: 
   Result {
     '0': '0xE87B970bfFD4bABbE6794470F97c1E62086A4CE6',
     '1': '0xAAbf093BB1Bc9E924C3e8DeDC850f559decbebc1',
     '2': BigNumber { _hex: '0x01' },
     from: '0xE87B970bfFD4bABbE6794470F97c1E62086A4CE6',
     to: '0xAAbf093BB1Bc9E924C3e8DeDC850f559decbebc1',
     tokens: BigNumber { _hex: '0x01' },
     length: 3 },
  decode: [Function],
  event: 'Transfer',
  eventSignature: 'Transfer(address,address,uint256)',
  removeListener: [Function],
  getBlock: [Function],
  getTransaction: [Function],
  getTransactionReceipt: [Function] } */
// const a =
// { txnHash: '0x37fee13fad4ac0d9915efec1a791689d0b927b73d57bf43b7d353109d9a0e374',
//   from: Result {
// 	 '0': '0xE87B970bfFD4bABbE6794470F97c1E62086A4CE6',
// 	 '1': '0xAAbf093BB1Bc9E924C3e8DeDC850f559decbebc1',
// 	//  '2': BigNumber { _hex: '0x01' },
// 	 from: '0xE87B970bfFD4bABbE6794470F97c1E62086A4CE6',
// 	 to: '0xAAbf093BB1Bc9E924C3e8DeDC850f559decbebc1',
// 	 tokens: BigNumber { _hex: '0x01' },
// 	 length: 3 },
//   status: 1,
//   blockNumber: 11073325,
//   type: 'DEPOSIT' }

const getAddresses = async () => {
  try {
    let addressArr = {};
    const ERC_COIN_DATA = await COINS.find({});
    for (let obj of ERC_COIN_DATA) {
      addressArr[obj.symbol] = {};
      addressArr[obj.symbol].address = obj.contractAddress;
      addressArr[obj.symbol].decimals = obj.decimals;
    }
    return addressArr;
  } catch (err) {
    console.log("Some Error Occurred: ", err);
    throw new Error(err);
  }
};
const provider = ethers.getDefaultProvider(config.NETWORK);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);

(async () => {
  const ERC_ADDRESSSES = await getAddresses();
  //   console.log(ERC_ADDRESSSES)
  for (let obj in ERC_ADDRESSSES) {
    const contract = new ethers.Contract(
      /* config.FACTORY_CONTRACT_ADDRESS */ ERC_ADDRESSSES[obj].address,
      ABI,
      wallet
    );

    contract.on("*", event => {
      // console.log(event.args);
      const data = {
        txnHash: event.transactionHash,
        from: Object.values(event.args)[0],
        to: Object.values(event.args)[1],
        value:
          `${Object.values(event.args)[2].toNumber()}` /
          10 ** ERC_ADDRESSSES[obj].decimals,
        coin: obj,
        status: 1,
        blockNumber: event.blockNumber,
        type: 'DEPOSIT'
      };
      console.log(data);
      // console.log(event.transactionHash);
    });
  }
})();

// for (let add of addressArr) {
// 	const contract = new ethers.Contract(
// 		/* config.FACTORY_CONTRACT_ADDRESS */ "0xB9838E78FdB9BD5b86f15349710bf929e85B66F4",
// 		ABI,
// 		wallet
// 	  );
	
// 	contract.on("*", event => {
// 	  // console.log(event.args);
// 	  const data = {
// 		txnHash: event.transactionHash,
// 		from: Object.values(event.args)[0],
// 		to: Object.values(event.args)[1],
// 		value: Object.values(event.args)[2].toNumber(),
// 		coin: "KCS",
// 		status: 1,
// 		blockNumber: event.blockNumber,
// 		type: "DEPOSIT"
// 	  };
// 	  console.log(data);
// 	  // console.log(event.transactionHash);
// 	});

// }


// console.log({ FROM: from, TO: to, VAL: tokens.toNumber(), VAL2: tokens });

// this.getBlock().then(function(block) {
//     console.log('BLOCK: ');
//     console.log(block);
// })
// });
