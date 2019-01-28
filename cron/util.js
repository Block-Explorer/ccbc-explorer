
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { forEachSeries } = require('p-iteration');
const { rpc } = require('../lib/cron');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const config = require('../config')


const coin = "z" + config.coin.toUpperCase() + "supply" // Prefix for Zerocoin

/**
 * Process the inputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 * @param {Object} block The Block Data.
 */
async function vin(rpctx, block) {
  // Setup the input list for the transaction.
  const txin = [];
  const vine = {
    blockHash: block.hash,
    blockHeight: block.height,
    address: "Generated",
    value: 0
  }
  if (rpctx.vin) {
    //console.log(block)
    const txIds = new Set();
    await forEachSeries(rpctx.vin, async (vin, index) => {

      const vinLookUp = await TX.aggregate([
        { $match: { txId: vin.txid } },
        { $project: { _id: 0, vout: 1, blockHash: 1, blockHeight: 1, } },
        { $unwind: "$vout" },
        { $match: { 'vout.n': vin.vout } },
      ])

      if (typeof vin.txid == 'undefined')
        vin.txid = 0

      if (typeof vinLookUp[0] != 'undefined') {

        vine.blockHash = (typeof vinLookUp[0].blockHash != 'undefined') ? vinLookUp[0].blockHash : block.hash
        vine.blockHeight = (typeof vinLookUp[0].blockHeight != 'undefined') ? vinLookUp[0].blockHeight : block.height


        vine.address = (typeof vinLookUp[0].vout.address != 'undefined') ? vinLookUp[0].vout.address : 0
        vine.value = (typeof vinLookUp[0].vout.value != 'undefined') ? vinLookUp[0].vout.value : 0

      }

      if (typeof vin.vout == 'undefined')
        vin.vout = 0

      if (typeof vin.coinbase == 'undefined')
        vin.coinbase = 0

      if (typeof vin.scriptSig != 'undefined') {
        if (typeof vin.scriptSig.asm == 'undefined')
          vin.scriptSig.asm = 0

        if (typeof vin.scriptSig.hex == 'undefined')
          vin.scriptSig.hex = 0
      }
      else {
        vin.scriptSig = {
          asm: 0,
          hex: 0
        }
      }

      txin.push({
        txId: vin.txid,
        blockHash: vine.blockHash,
        blockHeigth: vine.blockHeight,
        vout: vin.vout,
        address: vine.address,
        value: vine.value,
        coinbase: vin.coinbase,
        sequence: vin.sequence
      });


      txIds.add(`${vin.txid}:${vin.vout}`); //This is used for Unspend Transaction
    });

    //Remove unspent transactions.
    if (txIds.size) {
      await UTXO.remove({ _id: { $in: Array.from(txIds) } });
    }
  }
  return txin;
}

/**
 * Process the outputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 * @param {Number} blockHeight The block height for the tx.
 */
async function vout(rpctx, blockHeight) {
  // Setup the outputs for the transaction.
  const txout = [];
  if (rpctx.vout) {
    const utxo = [];
    let address;

    rpctx.vout.forEach((vout) => {
      if (vout.value <= 0 || vout.scriptPubKey.type === 'nulldata') {
        return;
      }
      address = "nonestandard"

      // If there is Address Overwrite the old one
      if (typeof vout.scriptPubKey.addresses != 'undefined')
        address = vout.scriptPubKey.addresses[0]

      //if there is no reqSigs Present force it to null
      if (typeof vout.scriptPubKey.reqSigs == 'undefined')
        vout.scriptPubKey.reqSigs = 0

      //if there is no ASM Present force it to null
      if (typeof vout.scriptPubKey.asm == 'undefined')
        vout.scriptPubKey.asm = 0

      //if there is no ASM Present force it to null
      if (typeof vout.scriptPubKey.hex == 'undefined')
        vout.scriptPubKey.hex = 0

      // If we do no thave a Vout Type force it to nonstandard
      if (typeof vout.scriptPubKey.type == 'undefined')
        vout.scriptPubKey.type = "nonstandard"
      else if (typeof vout.scriptPubKey.type == 'zerocoinmint')
        address = coin

      const to = {
        blockHeight,
        address: address,
        n: vout.n,
        value: vout.value,
        asm: vout.scriptPubKey.asm,
        hex: vout.scriptPubKey.hex,
        reqSigs: vout.scriptPubKey.reqSigs,
        type: vout.scriptPubKey.type,
      };

      txout.push(to);

      if (address != "nonestandard") {
        utxo.push({
          ...to,
          _id: `${rpctx.txid}:${vout.n}`,
          txId: rpctx.txid
        });
      }
    });

    // Insert unspent transactions.
    if (utxo.length) {
      await UTXO.insertMany(utxo);
    }
  }
  return txout;
}

/**
 * Process a proof of stake block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoS(block, rpctx) {
  // We will ignore the empty PoS txs.
  // if (rpctx.vin[0].coinbase && rpctx.vout[0].value === 0)
  //   return;

  // Let Both Run Parrallel
  const txin_q = vin(rpctx, block);
  const txout_q = vout(rpctx, block.height);
  const txin = await txin_q
  const txout = await txout_q


  const value_in = txin.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);

  const value_out = txout.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);


  const value_fee = (value_in - value_out != 0) ? (value_in + blockchain.getSubsidy(block.height)) - value_out : 0

  await TX.create({
    _id: rpctx.txid,
    txId: rpctx.txid,
    version: rpctx.version,
    locktime: rpctx.locktime,
    confirmations: rpctx.confirmations,
    blockHash: block.hash,
    blockHeight: block.height,
    blocktime: block.createdAt,
    vin: txin,
    vout: txout,
    value_in: parseFloat(value_in).toFixed(8),               //Total Value Received in that Transaction
    value_out: parseFloat(value_out).toFixed(8),               //Total Value Send in that Transaction
    value_fee: (isNaN(value_fee)) ? 0 : parseFloat(value_fee).toFixed(8),               //Total Amount Fee in this Transaction
    comment: "",                                   //Option to Place Comments for a Transaction
  });
}

/**
 * Handle a proof of work block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoW(block, rpctx) {

  // const txin = await vin(rpctx,block);
  // const txout = await vout(rpctx, block.height);

  // Let Both Run Parrallel
  const txin_q = vin(rpctx, block);
  const txout_q = vout(rpctx, block.height);
  const txin = await txin_q
  const txout = await txout_q

  const value_in = txin.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);

  const value_out = txout.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);


  //console.log(rpctx)
  await TX.create({
    _id: rpctx.txid,
    txId: rpctx.txid,
    version: rpctx.version,
    locktime: rpctx.locktime,
    confirmations: rpctx.confirmations,
    blockHash: block.hash,
    blockHeight: block.height,
    blocktime: block.createdAt,
    vin: txin,
    vout: txout,
    value_in: parseFloat(value_in).toFixed(8),               //Total Value Received in that Transaction
    value_out: parseFloat(value_out).toFixed(8),               //Total Value Send in that Transaction
    value_fee: 0,               //Total Amount Fee in this Transaction
    comment: "",                  //Option to Place Comments for a Transaction
  });
}


/**
 * Process a proof of stake block.
 * @param {Object} block The block model object.
 * @param int Index of the Transaction Proccessed.
 * @param {Object} rpctx The rpc object from the node.
 */
async function AddTransaction(block, txindex, rpctx) {
  let type = "unknown"
  let value_fee = 0

  // Let Both Run Parrallel
  const txin_q = vin(rpctx, block);
  const txout_q = vout(rpctx, block.height);
  const txin = await txin_q
  const txout = await txout_q

  //Find out the Type of Block
  if (txindex == 0 && typeof txout[0] !== 'undefined' && txout[0].value > 0 && txout[0].type !== 'nonestandard') 
    type = "POF" 
  else if (txindex == 1 && txin[0].address == txout[0].address && typeof txout[0] !== 'undefined' && txout[0].value > 0)
    type = "POS"


  const value_in = txin.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);

  const value_out = txout.reduce((accumulator, currentvalue) => {
    return accumulator + currentvalue.value
  }, 0);


  if (type == "POS")
    value_fee = (value_in - value_out != 0) ? (value_in + blockchain.getSubsidy(block.height)) - value_out : 0
  else if (type == "POF")
    value_fee = 0
  else value_fee = parseFloat(value_in).toFixed(8) - parseFloat(value_out).toFixed(8)


  await TX.create({
    _id: rpctx.txid,
    txId: rpctx.txid,
    version: rpctx.version,
    locktime: rpctx.locktime,
    confirmations: rpctx.confirmations,
    blockHash: block.hash,
    blockHeight: block.height,
    blocktime: block.createdAt,
    vin: txin,
    vout: txout,
    value_in: parseFloat(value_in).toFixed(8),               //Total Value Received in that Transaction
    value_out: parseFloat(value_out).toFixed(8),               //Total Value Send in that Transaction
    value_fee: (isNaN(value_fee)) ? 0 : parseFloat(value_fee).toFixed(8),               //Total Amount Fee in this Transaction
    comment: "",                                   //Option to Place Comments for a Transaction
  });

  return {
    value_in: parseFloat(value_in).toFixed(8),
    value_out: parseFloat(value_out).toFixed(8),
    value_fee: (isNaN(value_fee)) ? 0 : parseFloat(value_fee).toFixed(8),
    type: type
  }
}
/**
 * Will process the tx from the node and return.
 * @param {String} tx The transaction hash string.
 */
async function getTX(txhash) {
  const hex = await rpc.call('getrawtransaction', [txhash]);
  return await rpc.call('decoderawtransaction', [hex]);
}

module.exports = {
  addPoS,
  addPoW,
  AddTransaction,
  getTX,
  vin,
  vout
};
