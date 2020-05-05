require('dotenv').config();
require('../config/db'); /* Establishing MongoDB Connection */
const config = require('../config/appConfig');
const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
const ADDRESSES = require('../models/addresses');
const TRANSACTIONS = require('../models/transactions');
const COINS = require('../models/coins');
const ethers = require('ethers');
const ABI = require('../config/abiConfig.json');
const ABI_DEPOSIT_CONTRACT = require('../config/childAbi.json');
const provider = ethers.getDefaultProvider(config.NETWORK);
let contract = new ethers.Contract(
  config.FACTORY_CONTRACT_ADDRESS,
  ABI,
  provider
);
const debug = require('debug')('UTILS');
const DEBUG_MSGS_DRAIN = require('debug')('ERC-20-DRAIN');

/**
 * @author: Achal Singh
 * @description: ERC-20 Drain Operation Function Called By Token Withdrawal Cron in cronController.js.
 * Drains all the ERC20 Tokens from `Smart Contracts with ERC20 deposits`, by fetching entries from the `transactions` collection
 * and updates the draining transaction's status asynchronouly by calling @function checkERCDrainStatus.
 */
const drainERC20 = async (counter = 0) => {
  try {
    const transactions = await TRANSACTIONS.find({
      coin: { $ne: 'ETH' },
      type: 'DEPOSIT',
      isMoved: false,
      ERC20DrainHash: null
    });
    const wallet = new ethers.Wallet(
      config.PRIV_KEY_MAP[process.env.DEPLOYER_ADDRESS],
      provider
    );
    const count = await wallet.getTransactionCount();
    client.get('nonce', async (err, nonceFromRedis) => {
      if (counter < transactions.length) {
        contract = new ethers.Contract(
          transactions[counter].to,
          ABI_DEPOSIT_CONTRACT,
          wallet
        );
        let coinData = await COINS.findOne({
          symbol: transactions[counter].coin
        });
        const nonceCount = Number(nonceFromRedis) > count ? Number(nonceFromRedis) : count;
        const overrides = { nonce: nonceCount };
        DEBUG_MSGS_DRAIN(`
        *------------- ERC-20 DRAINING OPERATION (# of ADDRS TO DRAIN: ${transactions.length})---------------------*
        *  USER ADDRESS (TO BE DRAINED)   | ${transactions[counter].to}
        *  Amount At Addresses            | ${ethers.utils.parseUnits((transactions[counter].value).toString(), coinData.decimals)}                    
        *  Coin Contract Address          | ${coinData.contractAddress} 
        *-------------------------------------------------------------------------*`);
        const txn = await contract.functions.drainTokens20(
          coinData.contractAddress,
          ethers.utils.parseUnits((transactions[counter].value).toString(), coinData.decimals),
          overrides
        );
        // DEBUG_MSGS_DRAIN(`TRANSACTION NO.: ${counter + 1} SENT!: \n`, txn);
        /**
         * Updating ERC20 Drain Transaction Hash
         * Asynchronously Calling @function checkERCDrainStatus for updating the drain transaction's mining status */
        // DEBUG_MSGS_DRAIN('ERC20 Drain Hash: ', txn.hash);
        TRANSACTIONS.findOneAndUpdate(
          { txnHash: transactions[counter].txnHash },
          { ERC20DrainHash: txn.hash },
          { useFindAndModify: false }                                                           
        )
          .then(res => {
            checkERCDrainStatus(txn);
            client.set('nonce', txn.nonce + 1, redis.print);
            ++counter;
            drainERC20(counter);
          })
          .catch(err => {
            throw new Error(
              `Error while updating ERC-20 drain operation hash : ${err}`
            );
          });
      } else {
        DEBUG_MSGS_DRAIN(`
        *----------------------- 0 ADDRESSES TO DRAIN -----------------------*`);
        client.set('ERC20DrainCronStatus', 'false');
      }
    });
  } catch (error) {
    DEBUG_MSGS_DRAIN('Error Inside drainERC20: \n', error);
  }
};

/**
 * @author: Achal Singh
 * `HELPER` Function for drainERC20();
 * @description: Asynchronously checks the mining status of the drain transactions executed via Token Withdrawal Cron
 * and updates the same to the DB as soon as it is mined/deployed.
 * @param {object} txnObj: Transaction object received immediately after pushing the deployment transaction.
 */
const checkERCDrainStatus = async (txnObj) => {
  const txnMineData = await txnObj.wait();;
  TRANSACTIONS.findOneAndUpdate(
    { ERC20DrainHash: txnMineData.transactionHash },
    { isMoved: true, isERC20DrainMined: true },
    { useFindAndModify: false }
  ).then(res => {
    if (res) {
      DEBUG_MSGS_DRAIN(`
      *---------------------------------------*
      *         Drain Transaction Mined!      
      * ERC-20-Drain-Hash: ${txnMineData.transactionHash}
      *---------------------------------------*`);
      // DEBUG_MSGS_DRAIN('\nDB Updated ERC-20', res);
      return true;
    } else throw Error('checkERCDrainStatus() ERC-20 Drain Hash not found');
  });
}

/**
 * @author: Achal Singh
 * `HELPER` Function for generateAddresses();
 * @description: Asynchronously checks the mining status of the recently
 * deployed Smart Contract on the Ethereum Network & updates the same as soon as it
 * is mined/deployed.
 * @param {object} txnObj: Transaction object received immediately after pushing
 * the deployment transaction.
 * @param {object} isTxnViaAPI: A boolean Flag that tells the function to update the
 * 'allocation status' of the mined address, since it was deployed via API Call.
 */
const checkAddressStatus = async (txnObj, isTxnViaAPI) => {
  const txnMineData = await txnObj.wait();
  debug(`
  *--------------------- CONTRACT MINED! -------------------*
  *  Newly Generated Address    | ${txnMineData.logs[0].address}                    
  *  Transaction Hash           | ${txnMineData.transactionHash}
  *---------------------------------------------------------*`);
  if (txnMineData.status == 1) {
    /* Transaction is Mined Successfully, address created */
    if (isTxnViaAPI) {
      /* Transaction was published by an API Call */
      return Promise.all([
        ADDRESSES.findOneAndUpdate(
          { txnHash: txnMineData.transactionHash },
          {
            isAllocated: true,
            allocation_Date: new Date(),
            updated_At: new Date()
          },
          { useFindAndModify: false }
        ),
        ADDRESSES.update(
          { txnHash: txnMineData.transactionHash, address: null },
          { address: txnMineData.logs[0].address, updated_At: new Date() }
        )
      ]).then(() => {
            return true;
        })
        .catch(err => {
          throw new Error(
            `Error Inside checkAddressStatus on viatxnAPI case : ${err}`
          );
        });
    } else {
      /* Transaction was published by SC Cron Job */
      return ADDRESSES.update(
        { txnHash: txnMineData.transactionHash, address: null },
        { address: txnMineData.logs[0].address, updated_At: new Date() }
      ).then(() => {
          return true;
        })
        .catch(err => {
          throw new Error(
            `Error Inside checkAddressStatus on viatxnAPI case : ${err}`
          );
        });
    }
  } else {
    /* Smart Contract Deployment returns 'FAIL' status */
    return ADDRESSES.update(
      { txnHash: txnMineData.transactionHash, address: null },
      { address: '0', updated_At: new Date() }
    )
      .then(() => {
        debug(
          `Transaction returned 'FAILED' Status, TXHash: ${
            txnMineData.transactionHash
          }`
        );
        return true;
      })
      .catch(err => {
        throw new Error(`Error Inside checkAddressStatus: ${err}`);
      });
  }
};

/**
 * @author: Achal Singh
 * @description: Generates Smart Contract Addresses via address generating cron
 * job, saves the newly generated address to DB and also checks for the deployment
 * status asynchronouly by calling @function checkAddressStatus.
 */
const generateAddresses = async (batchSize, parReq, parRes) => {
  try {

    const owner = await contract.owner();
    const wallet = new ethers.Wallet(config.PRIV_KEY_MAP[owner], provider);
    const count = await wallet.getTransactionCount();
    client.get('nonce', async (err, nonceFromRedis) => {
    contract = new ethers.Contract(
      config.FACTORY_CONTRACT_ADDRESS,
      ABI,
      wallet
    );
    if (batchSize > 0) {
      const nonceCount = Number(nonceFromRedis) > count ? Number(nonceFromRedis) : count;
      const overrides = { nonce:  nonceCount};
      const txn = await contract.functions.createAccount(overrides);
      let options = {
        txnHash: txn.hash,
        fees: (txn.gasLimit.toNumber() * txn.gasPrice.toNumber()) / 10 ** 18,
        parentContract: txn.to,
        created_At: new Date()
      };
      ADDRESSES.create(options).then(async () => {
          --batchSize;
          if (parReq) {
            client.set('nonce', txn.nonce + 1, redis.print);
            checkAddressStatus(txn, true);
            parRes.status(200).json({ txnHash: txn.hash, address: null });
            return true;
          } else {
            const val = txn.nonce + 1;
            client.set('nonce', val, redis.print);
            checkAddressStatus(txn, false);
            generateAddresses(batchSize);
          }
        }).catch(err => {
          if (parReq) {
            parRes.status(400).json({
              errorCode : '006',
              msg: 'Something Went Wrong'
            });
            debug('Error Occurred in generateAddresses via API, /utils',err);
            throw err;
          } else {
            debug('Error Occurred in generateAddresses, /utils', err);
            //throw err;
          }
          generateAddresses(batchSize);
        });
    } else {
      debug(`
      *---------------------------------------*
      * CONTRACT DEPLOYMENT PROCESS COMPLETE! *
      *---------------------------------------*`);
      client.set('addressGenerationStatus', 'false');
      return true;
    }
  });
  } catch (err) {
    debug('Error Caught Inside generateAddresses(): \n', err);
    throw err;
  }
};

/**
 * @author: Achal Singh
 * @description: Fetches the given transaction hash's details and returns if it is valid.
 * @param {string} hash: Hash of a fund-transfer transaction.
 * @param {string} type: Type of transaction to be queried, either a 'DEPOSIT' or 'WITHDRAWAL'.
 */
const getTransactionDetails = async (parReq, parRes) => {
  const { txHash, type } = parReq.query;

  switch (type) {
    case 'DEPOSIT': {
      const txnData = await TRANSACTIONS.find({
        txnHash: txHash,
        type: 'DEPOSIT'
      });
      if (txnData.length !== 0) {
        provider.getTransactionReceipt(txHash).then(res => {
          parRes.status(200).json({
            txnHash: res.transactionHash,
            from: txnData[0].from,
            to: txnData[0].to,
            value: txnData[0].value,
            type: txnData[0].type,
            blockHash: res.blockHash,
            confirmations: res.confirmations,
            timestamp: new Date(txnData[0].updatedAt)
          });
        });
      } else {
        parRes.status(400).json({
          errorCode: '009',
          msg:'Please provide the txHash of a fund transfer-related transaction.'
        });
      }
      break;
    }
    case 'WITHDRAWAL': {
      const txnData = await TRANSACTIONS.find({
        txHashSubmit: txHash,
        type: 'WITHDRAWAL'
      });
      if (txnData.length !== 0) {
        if (txnData[0] /* && txnData.statusConfirm != 1 */) {
          if(txnData[0].txHashConfirm){
          parRes.status(200).json({
            txHashConfirmation: txnData[0].txHashConfirm,
            txHashInitiation: txnData[0].txHashSubmit,
            from: txnData[0].from,
            to: txnData[0].to,
            coin: txnData[0].coin,
            value: txnData[0].value,
            statusConfirmation: txnData[0].statusConfirm,
            statusInitiation: txnData[0].statusSubmit,
            timestamp: txnData[0].updatedAtConfirm
          });
          }else{
            debug('Withdrawal transaction under processing. Please try again.');
          parRes.status(500).json({
            code: '019',
            msg: 'Transaction Confirmation under processing. Please try again.'
          });
          }
        } else {
          debug('Withdrawal transaction confirmation Failed!');
          parRes.status(500).json({
            code: '015',
            msg: 'Transaction Confirmation Failed.'
          });
        }
      } else {
        debug('Transaction Hash not exist in DB.');
        parRes.status(500).json({
          code: '015',
          msg: 'Transaction initiation does not exist in DB.'
        });
      }
      break;
    }
    default: {
      break;
    }
  }
  try {
  } catch (err) {
    debug('Error Occurred inside getTransactionDetails(): ', err);
    parRes.status(400).json({
      errorCode: '006',
      msg: 'Something Went Wrong.'
    });
  }
};

/* Helper Function for listAllDeposits()*/
// const checkDateFormat = (dateString) => {
//   const [year, month, day] = dateString.split('-');
//   // const [year, month, day] = dateString.split('-');
//   debug(year > 1970 && 2038 >= year, 12 >= month && month >= 1, 31 >= day >= 1);  
//   if (year > 1970 && 2038 >= year && 12 >= month && month >= 1 && 31 >= day >= 1) {
//     return true;
//   } else {
//     return false;
//   }
// };

/* Helper Function for listAllDeposits()*/
const toUTC = (date) => {
  let now = new Date(date);
  let nowUtc = new Date( now.getTime() + (now.getTimezoneOffset() * 60000));
  return nowUtc;
};

/**
 * @author: Achal Singh
 * @description: Fetches all the deposit transactions to any of the user's Smart Contract Addresses.
 * @param {string} fromDate: The date 'from' which the records need to fetched (YYYY-MM-DDThh:mm:ssZ).
 * @param {string} toDate: The date 'to' which the records need to fetched (YYYY-MM-DDThh:mm:ssZ).
 * @param {string/Number} limit: Number of records to be shown at a time.
 * @param {string} coin: The coin for which the records need to fetched.
 * @param {Number} pageNum: The page index for which records need to be fetched.
 */
const listAllDeposits = async (parReq, parRes) => {
  const { fromDate, toDate, limit, coin, pageNum } = parReq.body;
  try {
    if ((new Date(fromDate)).getTime() > 0 && (new Date(toDate)).getTime() > 0) { 
      const dataArr = new Array();
      const prom = await Promise.all([
        TRANSACTIONS.find({
          createdAt: {
            $lte: toUTC(new Date(toDate)) /* + 86399999 */,
            $gte: toUTC(new Date(fromDate))
          },
          type: 'DEPOSIT',
          coin: coin || { $ne: null }
        })
          .skip(
            Number(pageNum || 1) > 0
              ? (Number(pageNum || 1) - 1) * Number(limit || Number(config.TXN_DISPLAY_LIMIT))
              : 0
          )
          .limit(Number(limit) || Number(config.TXN_DISPLAY_LIMIT)),
        /* Getting total number of transaction records */
        TRANSACTIONS.find({
          createdAt: {
            $lte: toUTC(new Date(toDate))/*  + 86399999 */,
            $gte: toUTC(new Date(fromDate))
          },
          type: 'DEPOSIT',
          coin: coin || { $ne: null }
        }).count()
      ]);
      const cal = Number(prom[1]) / Number(limit || config.TXN_DISPLAY_LIMIT);
      let totalPageCount;
      if (cal < 1) totalPageCount = 1;
      else totalPageCount = Number.isInteger(cal) && cal > 1 ? cal : cal + 1;
      for (let tx of prom[0]) {
        dataArr.push({
          txnHash: tx.txnHash,
          from: tx.from,
          to: tx.to,
          value: Number(tx.value),
          coin: tx.coin,
          type: tx.type,
          isMined: tx.status == 1 ? true : false,
          timestamp: new Date(tx.createdAt)/* .getTime() */
        });
      }
      if ((pageNum ? pageNum : 1) <= (totalPageCount || 1)) {
        if (cal == 0)
          parRes.status(200).json({
            pageCount: 0,
            data: dataArr
          });
        else
          parRes.status(200).json({
            pageCount: cal < 1 ? 1 : totalPageCount,
            data: dataArr
          });
      } else
      /* Invoked if pageNum > totalPageCount*/
        parRes.status(400).json({
          errorCode: '010',
          pageCount: cal < 1 ? 1 : totalPageCount,
          msg: `'pageNum' is more than total number of pages (i.e. ${ cal < 1 ? 1 : totalPageCount }).`
        }); 
    } else {
      /* Invoked if either date format is incorrect*/
      parRes.status(400).json({
        errorCode: '010',
        msg: 'Incorrect Date Format, your input dates should be in (YYYY-MM-DDThh:mm:ssZ) format.'
      });
    }
  } catch (err) {
    debug('Error Occurred inside listAllDeposits()', err);
    parRes.status(400).json({
      errorCode: '006',
      msg: 'Something Went Wrong.'
    });
  }
};

module.exports = {
  generateAddresses,
  getTransactionDetails,
  listAllDeposits,
  drainERC20
};	