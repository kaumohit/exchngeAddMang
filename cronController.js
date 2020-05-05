require("dotenv").config();
const cron = require("node-cron");
const utils = require("./controllers/utils");
const redis = require("redis");
const client = redis.createClient();
const ADMIN_CONFIG = require("./models/configurations");
const ADDRESSES = require("./models/addresses");
const debug = require("debug")("CRON");
const Web3 = require("web3");

//Infura HttpProvider Endpoint
web3 = new Web3(new Web3.providers.HttpProvider(process.env.URL_ETH));

/**
 * @author: Achal Singh.
 * @description: `ADDRESS GENERATION CRON process`, autonomously checks
 * for available/Un-allocated addresses in DB and deploys new contracts
 * when the amount of un-allocated addresses drops below the set "BUFFER_LIMIT"
 * value in the DB.
 */
cron.schedule("*/30 * * * * *", () => {
  client.get("addressGenerationStatus", async (err, isActive) => {
    if (isActive == "true") {
      debug("\nAddress Generation Process is Already Running...\n");
    } else {
      /**
       * @allocAddCount -->> Total number addresses that have been 'allocated' to users, in DB.
       * @unallocAddCount -->> Total number addresses that are 'unallocated' to users, in DB.
       * @bufferLimit -->> The percentage of (Un-allocated addresses) / (total addresses) below which the address generation process will start.
       * @type {number} -->> All 3 letiables.
       */
      const [
        allocAddCount,
        unallocAddCount,
        adminData /* bufferLimit */
      ] = await Promise.all([
        ADDRESSES.find({ isAllocated: true }).count(),
        ADDRESSES.find({ isAllocated: false }).count(),
        ADMIN_CONFIG.find(
          {},
          "GEN_ADDRESS_AUTO_MODE CONTRACT_BATCH_SIZE BUFFER_LIMIT -_id"
          )
        ]);
      const cal =
        unallocAddCount == 0
          ? 0
          : (unallocAddCount / adminData[0].CONTRACT_BATCH_SIZE) * 100;
          debug(`
            *---- ADDRESS GENERATION CRON PROCESS ----*
            *  CONFIG-SWITCH (ON/OFF) | ${adminData[0].GEN_ADDRESS_AUTO_MODE ? 'ON':'OFF'}
            *  Allocated Addresses    | ${allocAddCount}                    
            *  Un-Allocated Addresses | ${unallocAddCount}                  
            *  Current Buffer Limit   | ${adminData[0].BUFFER_LIMIT}%        
            *  Deployment Batch Size  | ${adminData[0].CONTRACT_BATCH_SIZE} 
            *-----------------------------------------*`);
      if (cal <= Number(adminData[0].BUFFER_LIMIT)) {
        debug(`
              *-----------------------------------------------------*
              * # of Available Addresses are below the Buffer Limit *
              * AVAILABLE ADDRESSES %age: ${(unallocAddCount / adminData[0].CONTRACT_BATCH_SIZE) * 100}%  < BUFFER LIMIT ${Number(adminData[0].BUFFER_LIMIT)}%      *
              ------------------------------------------------------*`);
        const isAutoModeEnabled = adminData[0].GEN_ADDRESS_AUTO_MODE;
        const batchSize = adminData[0].CONTRACT_BATCH_SIZE;
        if (isAutoModeEnabled) {
    debug(`
            *---------------------------------------------- *
            *                                               *
            *     DEPLOYING CONTRACTS AUTONOMOUSLY          *
            *    (Started @: ${new Date().toDateString})    *
            *                                               *
            *-----------------------------------------------*`);
          client.set("addressGenerationStatus", "true");
          utils.generateAddresses(batchSize);
        } else debug(`
                      *----------------------------------------------*
                      *                                              *
                      *        MASTER CRON SWITCH OFF IN CONFIG      *
                      *                                              *
                      -----------------------------------------------*`);
      } else {
        debug(`
              *------------------------------------------------------*
              * AVAILABLE ADDRESSES %age: ${(unallocAddCount / adminData[0].CONTRACT_BATCH_SIZE) * 100}%  > BUFFER LIMIT (${Number(adminData[0].BUFFER_LIMIT)})%  *
              *          NO NEED TO DEPLOY CONTRACTS                 *
              -------------------------------------------------------*`);
      }
    }
  });
});

/**
 * @author: Achal Singh.
 * @description: `ERC-20 TOKEN WITHDRAWAL CRON process`, checks for incoming ERC20 deposits
 * on User Contract Addresses.
 * `IMPORTANT NOTE: This Cron process will NOT work if the ADDRESS GENERATION CRON process is already running.` 
 */
cron.schedule("*/30 * * * * *", async () => {
  client.get("addressGenerationStatus", (err1, cronStatus) => {
    client.get("ERC20DrainCronStatus", async (err2, ercCronStatus) => {
      if (err1 || err2) {
        console.log(err1 || err2);
      } else if (cronStatus == "false" && ercCronStatus == "false") {
        try {
          client.set("ERC20DrainCronStatus", "true");
          utils.drainERC20();
        } catch (err) {
          debug(err);
        }
      } else {
        if (ercCronStatus == "true") debug("\nERC-20 Drain Cron is already running...");
        if (cronStatus == "true") debug("\nERC-20 Drain Cron is NOT Running as Smart Contract Deployment Cron is Running");
      }
    });
  });
});