
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const config = require ('../config')
//const utiln = require('util')
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');

const coin = "z"+config.coin.toUpperCase()+"supply" // Prefix for Zerocoin


/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocks(start, stop, clean = false) {
  console.log(`Current Block: ${start} - Stop Block: ${stop}`)
  //This makes sure that there is no data for the blocks we are about to scan
  if (clean) {
    await Block.deleteMany({ height: { $gte: start, $lte: stop } });
    await TX.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
    await UTXO.deleteMany({ blockHeight: { $gte: start, $lte: stop } });
  }

  //Check if the last Block has a Nextblock Field or not if not we need to update it
  if(start > 1){
  const lastblock = start - 1
  const lastblock_hash = await rpc.call('getblockhash', [lastblock]);
  const lastblock_rpcblock = await rpc.call('getblock', [lastblock_hash]);
 

  await Block.findOneAndUpdate(
    { height: lastblock }, //This is the Search Field
    { nextblockhash: lastblock_rpcblock.nextblockhash ? lastblock_rpcblock.nextblockhash : 'TOBEDETERMINED'  }, //This is the Replacement Field
    { runValidators: true})// validate before update
  }else console.log(`Lastblock Check Skipped ${start}`)

  for(let height = start; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    const block = new Block({
      hash,
      confirmations: rpcblock.confirmations,
      size: rpcblock.size,  
      height,
      version: rpcblock.version,
      merkleroot: rpcblock.merkleroot,
      acc_checkpoint : (typeof rpcblock.acc_checkpoint !== 'undefined') ? rpcblock.acc_checkpoint : null,
      txs: rpcblock.tx ? rpcblock.tx : [],
      time:new Date(rpcblock.time * 1000),
      createdAt: new Date(rpcblock.time * 1000), //TODO: Remove this see model Block
      nonce: rpcblock.nonce,
      bits: rpcblock.bits, 
      difficulty: rpcblock.difficulty,
      chainwork: rpcblock.chainwork,
      previousblockhash: (rpcblock.height == 1) ? 'GENESIS' : (rpcblock.previousblockhash) ? rpcblock.previousblockhash : 'UNKNOWN',
      nextblockhash: rpcblock.nextblockhash ? rpcblock.nextblockhash : 'TOBEDETERMINED',
      moneysupply: rpcblock.moneysupply ? rpcblock.moneysupply : 0,
      zerosupply : (typeof rpcblock[coin] !== 'undefined') ? rpcblock[coin] : null,
      value_in :0, 
      value_out :0,
      value_fee :0,
      value:0,
      type: "unknown" 
    });

    let value_in = 0
    let value_out = 0
    let value_fee = 0
    await forEachSeries(block.txs, async (txhash ,index) => {
      const rpctx = await util.getTX(txhash);

      const feedback = await util.AddTransaction(block, index, rpctx);
      //console.log(feedback)
      if(block.type == 'unknown')
      block.type = feedback.type
      value_in  = Number(value_in)  +  Number(feedback.value_in)
      value_out = Number(value_out) + Number(feedback.value_out)
      value_fee = Number(value_fee) + Number(feedback.value_fee)      
    });

    block.value_in  = value_in
    block.value_out = value_out
    block.value_fee = value_fee
    block.value = Number(value_in) + Number(value_out) + Number(value_fee)
    //console.log(block)

    await block.save().catch((error) => {
      console.log(error.message);
    });
    console.log(`BLock Saved: ${ block.height  }`);
    console.log(`Height: ${ block.height } Hash: ${ block.hash }`);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'block';
  let code = 0;

  try {
    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: -1});

    let clean = true; // Always clear for now.
    let dbHeight = block && block.height ? block.height : 1;
    let rpcHeight = info.blocks;

    // If heights provided then use them instead.
    if (!isNaN(process.argv[2])) {
      clean = true;
      dbHeight = parseInt(process.argv[2], 10);
    }
    if (!isNaN(process.argv[3])) {
      clean = true;
      rpcHeight = parseInt(process.argv[3], 10);
    }
    console.log(dbHeight, rpcHeight, clean);
    // If nothing to do then exit.
    if (dbHeight >= rpcHeight) {
      return;
    }

    // If starting from genesis skip.
    else if (dbHeight === 0) {
      dbHeight = 1;
    }

    locker.lock(type);
    await syncBlocks(dbHeight, rpcHeight, clean);
  //await syncBlocks(2115, 2115, clean);
   //await syncBlocks(1, 1, clean);
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
