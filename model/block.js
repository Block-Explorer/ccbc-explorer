
const mongoose = require('mongoose');

/**
 * Block
 *
 * Is the system representation of a block
 * that closely reflects that used on the network.
 */
const Block = mongoose.model('Block', new mongoose.Schema({
  __v: { select: false, type: Number },
  bits: { required: true, type: String },
  confirmations: { required: true, type: Number },
  createdAt: { required: true, type: Date },
  diff: { required: true, type: String },
  hash: { index: true, required: true, type: String, unique: true },
  height: { index: true, required: true, type: Number },
  merkle: { required: true, type: String },
  nonce: { required: true, type: Number },
  prev: { required: true, type: String },
  next: { required: false, type: String }, // The next block 
  size: { type: Number },
  txs: { default: [], required: true, type: [String] },
  ver: { required: true, type: Number },
  moneysupply:  { required: false, type: Number }, // This is Optional to some wallets  like PIVX
}, { versionKey: false }), 'blocks');

module.exports =  Block;
/**
 * Added Next Block - This will cause issue on the last block synced 
 * since it does not have next block value yet in order to fix it we have to make sure we update that
 * block on scan
 * 
 * supply:
 * The Value moneysupply has been added in the PIVX Wallets 
 * This keeps track of the curent supply in the Wallets
 */
