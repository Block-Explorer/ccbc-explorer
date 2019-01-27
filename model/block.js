
const mongoose = require('mongoose');
/**
 *  PIVX uses Z Supply
 * we need to log thiss in the DB as Well if we want this to be accurate
 */
const zSupply = new mongoose.Schema({
  __v: { select: false, type: Number },
  "1": {required: true, type: Number },
  "5": {required: true, type: Number },
  "10": {required: true, type: Number },
  "50": {required: true, type: Number },
  "100": {required: true, type: Number },
  "500": {required: true, type: Number },
  "1000": {required: true, type: Number },
  "5000": {required: true, type: Number },
  "total": {required: true, type: Number },
});
/**
 * Block
 *
 * Is the system representation of a block
 * that closely reflects that used on the network.
 */
const Block = mongoose.model('Block', new mongoose.Schema({
  __v: { select: false, type: Number },
  hash: { index: true, required: true, type: String, unique: true },
  confirmations: { required: true, type: Number },
  size: { required: true , type: Number },
  height: { index: true, required: true, type: Number },
  version: { required: true, type: Number },
  merkleroot: { required: true, type: String },
  acc_checkpoint : {type: String},
  txs: { default: [], required: true, type: [String] }, //txs referes to tx from wallet
  time: {required: true, type: Date},
  //TODO: Remove Created At since its naming is not complined with the Blockchain 
  createdAt: { required: true, type: Date }, 
  nonce: { required: true, type: Number },  
  bits: { required: true, type: String },
  difficulty: { required: true, type: String },
  chainwork:  { required: true, type: String }, // The chainwork is used to identify the correct chain, the biggest chainwork value means the strongest or the correct chain.
  previousblockhash: { required: true, type: String },
  nextblockhash: { required: true, type: String }, // The next block 
  moneysupply:  { type: Number }, // This is Optional to some wallets  like PIVX
  zerosupply:{type:zSupply},
  //TODO: Add ZPivx to The Explorer this will be tricky since people Rename ZPivx to like zCCBCsupply
  value_in : { required: true, type: Number },
  value_out : { required: true, type: Number },
  value_fee : { required: true, type: Number },
  value_reward : { required: true, type: Number },
  type: {required: true, type: String} 
}, { versionKey: false }), 'blocks');

module.exports =  Block;
/**
 * Added Next Block - This will cause issue on the last block synced 
 * since it does not have next block value yet in order to fix it we have to make sure we update that
 * block on scan
 * 
 * acc_checkpoint:
 * Unlike most other cryptocurrencies that currently utilize a zerocoin-based protocol, 
 * PIVX zPIV utilizes a very efficient accumulator checkpointing system which allows the 
 * zPiv spend process to utilize checkpoints that contains all mints that were made prior to 
 * the zPiv mint being spent, as well as  a user selected amount of zPiv mints beyond the checkpoint.
 * This allows for a large pool of coins in the accumulator while still having much smaller computation 
 * requirements. PIVX’s zPiv implementation yields minimal resource consumption and makes zPIV 
 * transactions one of the fastest private transfers in the market today.
 * 
 * moneysupply:
 * The Value moneysupply has been added in the PIVX Wallets 
 * This keeps track of the curent supply on the chain at the current block Heigth
 * 
 * chainwork:
 * The chainwork value is really just the total amount of work in the chain.
 * It is the total number of hashes that are expected to have been necessary to produce the current chain, 
 * in hexadecimal. The chainwork is used to identify the correct chain, the biggest chainwork value means 
 * the strongest or the correct chain.
 * 
 * type:
 * Will Reflect the Generating of Block eg POS / POW / POB
 * POS - Proof of Stake
 * POW - Proof of Work
 * POB - Proof of Burn 
 */
