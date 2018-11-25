const mongoose = require('mongoose');
/**
 * Dnsseeds
 *
 * List of Seeds gathered from the Dns Seeder
 */
const Seed = mongoose.model('Seed', new mongoose.Schema({
  ip: { index: true, required: true, type: String },
  port: {required: true, type: Number },
  country: { type: String },
  countryCode: { type: String },
  timeZone: { type: String },
  status: { index: true, required: true, type: Number },
  createdAt: { required: true, type: Date },
  lastScanned: { required: true, type: Date },
  last_2_hours: {required: true, type: Number, default: 0},
  last_8_hours: {required: true, type: Number, default: 0 },
  last_1_day: {required: true, type: Number, default: 0 },
  last_7_days: {required: true, type: Number, default: 0 },
  last_30_days: {required: true, type: Number, default: 0 },
  blockheight: {index: true , required: true, type: Number },
  svcs: {required: true, type: Number },
  protocol_version: {index: true , required: true, type: Number },
  wallet_version: {required: true, type: String }
}, { versionKey: false }), 'seed');

module.exports =  Seed;
