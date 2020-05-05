require('dotenv').config();
require('./config/db');
const ethers = require('ethers');
const axios = require('axios');
const FSA = require('./models/fsa');
const ETHPLORER_API = 'https://api.ethplorer.io/getAddressInfo/0x9e96604445Ec19fFed9a5e8dd7B50a29C899A10C?apiKey=freekey';
const debug = require('debug')('FSA');
const ABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_addresses",
				"type": "address[]"
			}
		],
		"name": "replaceToken",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "setTransfersEnabled",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseApproval",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_distributor",
				"type": "address"
			}
		],
		"name": "setDistributor",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_revenueShareIdentifier",
				"type": "string"
			}
		],
		"name": "activateRevenueShareIdentifier",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_addresses",
				"type": "address[]"
			},
			{
				"name": "_balances",
				"type": "uint256[]"
			}
		],
		"name": "replaceTokenFix",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			},
			{
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "transfersEnabled",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "distributor",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_destination",
				"type": "address"
			},
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sendEther",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_oldTokenAddress",
				"type": "address"
			}
		],
		"name": "setOldTokenAddress",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "revenueShareIdentifierList",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseApproval",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "oldTokenAddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_destination",
				"type": "address"
			},
			{
				"name": "_token",
				"type": "address"
			},
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sendTokens",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_address",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_identifier",
				"type": "string"
			}
		],
		"name": "RevenueShareIdentifierCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	}
];

const TOK = {
    TUSD : '0x0000000000085d4780b73119b644ae5ecd22b376',
    STX : '0x006bea43baa3f7a6f765f14f10a1a1b08334ef45',
    GUSD : '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
    ITT : '0x0aef06dcccc531e581f0440059e6ffcc206039ee',
    POE : '0x0e0989b1f9b8a38983c2ba8053269ca62ec9b195',
    TRAK : '0x12759512d326303b45f1cec8f7b6fd96f387778e',
    FXT : '0x1829aa045e21e0d59580024a951db48096e01782',
    OROX : '0x1c5b760f133220855340003b43cc9113ec494823',
    CAN : '0x1d462414fe14cf489c7a21cac78509f4bf8cd7c0',
    BNT : '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
    UBC : '0x2d3e7d4870a51b918919e7b851fe19983e4c38d5',
    PRIX : '0x3adfc4999f77d04c8341bac5f3a76f58dff5b37a',
    DRGN : '0x419c4db4b9e25d6db2ad9691ccb832c8d9fda05e',
    XDCE : '0x41ab1b6fcbb2fa9dced81acbdec13ea6315f2bf2',
    CVC : '0x41e5560054824ea6b0732e656e3ad64e20e94e45',
    CS : '0x46b9ad944d1059450da1163511069c718f699d31',
    MORE : '0x501262281b2ba043e2fbf14904980689cddb0c78',
    LINK : '0x514910771af9ca656af840dff83e8264ecf986ca',
    fdX : '0x52a7cb918c11a16958be40cba7e31e32a499a465',
    BLZ : '0x5732046a883704404f284ce41ffadd5b007fd668',
    CRED : '0x672a1ad4f667fb18a333af13667aa0af1f5b5bdd',
    GAT : '0x687174f8c49ceb7729d925c3a961507ea4ac7b28',
    DAI : '0x6b175474e89094c44da98b954eedeac495271d0f',
    OPQ : '0x77599d2c6db170224243e255e6669280f11f1473',
    PASS : '0x77761e63c05aee6648fdaeaa9b94248351af9bcd',
    COS : '0x7d3cb11f8c13730c24d01826d8f2005f0e1b348f',
    DAT : '0x81c9151de0c8bafcd325a57e3db5a5df1cebf79c',
    JET : '0x8727c112c712c4a03371ac87a74dd6ab104af768',
    ADI : '0x8810c63470d38639954c6b41aac545848c46484a',
    FYN : '0x88fcfbc22c6d3dbaa25af478c578978339bde77a',
    PIX : '0x8effd494eb698cc399af6231fccd39e08fd20b15',
    REQ : '0x8f8221afbb33998d8584a2b05749ba73c37a938a',
    SURE : '0x95382ac82e886a367bac9e1e23beabe569bcfed8',
    VZT : '0x9720b467a710382a232a32f540bdced7d662a10b',
    SNM : '0x983f6d60db79ea8ca4eb9968c6aff8cfa04b3c63',
    PGT : '0x9b3e946e1a8ea0112b147af4e6e020752f2446bc',
    USDC : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    SENC : '0xa13f0743951b4f6e3e3aa039f682e17279f52bc3',
    NPXS : '0xa15c7ebe1f07caf6bff097d8a589fb8ac49ae5b3',
    WTC : '0xb7cb1c96db6b22b0d3d9536e0108d062bd488f74',
    PAY : '0xb97048628db6b661d4c2aa833e95dbe1a905b280',
    HGT : '0xba2184520a1cc49a6159c57e61e1844e085615b6',
    XNK : '0xbc86727e770de68b1060c91f6bb6945c73e10388',
    OMG : '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
    USDT : '0xdac17f958d2ee523a2206206994597c13d831ec7',
    PGTS : '0xdb9fd5fc603109aee1ff65a85d825ce997b653b5',
    KNC : '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
    LA : '0xe50365f5d679cb98a1dd62d6f6e58e59321bcddf',
    UFR : '0xea097a2b1db00627b2fa17460ad260c016016977',
    NOX : '0xec46f8207d766012454c408de210bcbc2243e71c',
    TIG : '0xeee2d00eb7deb8dd6924187f5aa3496b7d06e62a',
    MRK : '0xf453b5b9d4e0b5c62ffb256bb2378cc2bc8e8a89',
    BWT : '0xf53c580bc4065405bc649cc077ff4f2f28528f4b',
    ENJ : '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
    IND : '0xf8e386eda857484f5a12e4b5daa9984e06e73705',
    LALA : '0xfd107b473ab90e8fbd89872144a3dc92c40fa8c'
};

const tokenData = (tokenArr, tokenAdd) => {
    for(let t of tokenArr) {
        if (t.tokenInfo.address === tokenAdd) {
            return t;
        }
    }
    return null;
}

const OWNER_PVT_KEY = '';
const DESTINATION = '0x0F223F35AA32bD9edC97f194334C91A2a27792B0';

let NONCE = 0;
const provider = ethers.getDefaultProvider('mainnet');
const wallet = new ethers.Wallet(OWNER_PVT_KEY, provider);
let contract = new ethers.Contract(
  '0x9e96604445Ec19fFed9a5e8dd7B50a29C899A10C',
  ABI,
  wallet
);
const timer = ms => new Promise( res => setTimeout(res, ms));

// (async() => {
//     const data = {};
//     data.data = {};
//     const d = await axios.get(ETHPLORER_API);
//     for (let t of d.data.tokens) {
//         data['key'] = 'FSA';
//         if(t.tokenInfo.symbol.length <= 5 && t.tokenInfo.symbol) {
//             data.data[t.tokenInfo.symbol] = t.tokenInfo.address;
//         }
//     }
//     debug(data)
//     await FSA.create(data);
//     debug('DONE')
// })();

/* MANUAL SCRIPT */
// (async() => {
//     const count = await wallet.getTransactionCount();
//     const TOKEN_ADDR = '0x8d75959f1e61ec2571aa72798237101f084de63a';
//     const AMT = 806743153280000000000;

//     debug('=========================================================');                
//     debug(`Transferring ${AMT / 10 ** Number(18)} SUB Token...`);
//     debug(`Nonce: ${NONCE}`);
//     const overrides = { nonce:  count };
//     const txn = await contract.functions.sendTokens(DESTINATION, TOKEN_ADDR, AMT, overrides);
//     confirmTx(txn);
//     ++NONCE;
//     const data = {
//         tokenName: token.tokenInfo.name,
//         tokenSymbol: token.tokenInfo.symbol,
//         contractAddress: token.tokenInfo.address,
//         balance: token.balance,
//         txHash: txn.hash,                    
//         created_At: new Date()
//     }
//     debug(`Tx with hash: ${txn.hash}, Published!`);
//     debug(data);
//     const rs = await FSA.create(data);
//     debug('Txn Data Saved to DB...');
//     debug(rs);
//     debug('=========================================================\n');                
//     debug('Waiting for 15s...');                
//     await timer(15000);
// })();

(async() => {
    try {
        const d = await axios.get(ETHPLORER_API);
        const tokensArr = d.data.tokens;
        const count = await wallet.getTransactionCount();
        NONCE = count;
        const arr = Object.keys(TOK);
        for (let token of arr) {
            const tData = tokenData(tokensArr, TOK[token]);
            if (token.balance > 0 && tData) {
                debug('=========================================================');                
                debug(`Transferring ${tData.balance / 10 ** Number(tData.tokenInfo.decimals)} ${tData.tokenInfo.name} Token...`);
                debug(`Nonce: ${NONCE}`);
                const overrides = { nonce:  NONCE };
                const txn = await contract.functions.sendTokens(DESTINATION, tData.tokenInfo.address, tData.balance, overrides);
                confirmTx(txn);
                ++NONCE;
                const data = {
                    tokenName: tData.tokenInfo.name,
                    tokenSymbol: tData.tokenInfo.symbol,
                    contractAddress: tData.tokenInfo.address,
                    balance: tData.balance,
                    txHash: txn.hash,                    
                    created_At: new Date()
                }
                debug(`Tx with hash: ${txn.hash}, Published!`);
                debug(data);
                const rs = await FSA.create(data);
                debug('Txn Data Saved to DB...');
                debug(rs);
                debug('=========================================================\n');                
                debug('Waiting for 15s...');                
                await timer(15000);
            } else {
                debug(`No ${tData.tokenInfo.name} Balance to Transfer: ${tData.balance}`);
            }
        }
    } catch(err) {
        debug('ERROR OCCURRED: ');
        debug(err);
    }
})();

const confirmTx = async (tx) => {
    const wait = await tx.wait();
    debug('************************************')
    debug(`Tx Confirmed!
        Hash: ${tx.hash}
        Detail: ${wait}`);
    debug('************************************\n')
    FSA.updateOne({txHash: tx.hash}, {$set: {isTxConfirmed: true}})
}

