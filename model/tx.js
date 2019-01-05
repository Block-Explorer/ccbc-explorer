
const mongoose = require('mongoose');

/**
 * TXIn
 *
 * The inputs for a tx.
 */
const TXIn = new mongoose.Schema({
  __v: { select: false, type: Number },
  txId: {  required: true, type: String },
  blockHash: {  required: true, type: String },
  blockHeigth: {  required: true, type: Number },
  vout: {  required: true, type: Number },
  address: {  required: true, type: String },
  value:{  required: true, type: Number },
  coinbase: {  required: true, type: String },
  asm:{ type: String},
  hex: { type: String},
  sequence: {  required: true, type: Number },  
});
/**
 * txID - Transaction ID From the Output (Where the $$$ comes from)
 * blockHash - The BlockHash of the TX (Output)
 * blockHeigth - The BlockHeigth of the TX (Output)
 * vout - The Array Position of the Vout used for Vin
 * address - The Address where the Transaction came From
 * value - The Amount of Coins from The Output Comming as an Input
 * coinbase - Generated Address? if this says Generated usually means that Addres will be empty
 * Seqeunce - Generated Address? if this says Generated usually means that Addres will be empty
 */

/**
 * TXOut
 *
 * The outputs for a tx.
 */
const TXOut = new mongoose.Schema({
  __v: { select: false, type: Number },
  address: { required: true, type: String },
  n: { required: true, type: Number },
  value: { required: true, type: Number },
  asm:{ type: String},
  hex: { type: String},
  reqSigs :{required: true, type: Number},
  type: { required: true, type: String }
});

/**
 * Setup the schema for transactions.
 */
const txSchema = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  txId: { index: true, required: true, type: String },
  version: { required: true, type: Number },
  locktime : { required: true, type: Number },
  confirmations : { type: Number },
  blockHash: { required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  blocktime: { index: true, required: true, type: Date },
  vin: { required: true, type: [TXIn] },
  vout: { required: true, type: [TXOut] },
  value_in : { required: true, type: Number },                //Total Value Received in that Transaction
  value_out : { required: true, type: Number },               //Total Value Send in that Transaction
  value_fee : { required: true, type: Number },               //Total Amount Fee in this Transaction
  comment: { type: String },                  //Option to Place Comments for a Transaction
}, { versionKey: false });

/**
 * Helper method to return vout value for tx.
 */
txSchema.virtual('value')
  .get(() => {
    return this.vout.reduce((acc, vo) => acc + vo.value, 0.0);
  });

/**
 * TX
 *
 * The transaction object.  Very basic as
 * details will be requested by txid (hash)
 * from the node on demand.  A cache can be
 * implemented if needed for recent txs.
 */
const TX = mongoose.model('TX', txSchema, 'txs');

module.exports =  TX;
