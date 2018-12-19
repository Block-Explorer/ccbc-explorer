
require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
const config = require('../config');
// Models.
const Rich = require('../model/rich');
const UTXO = require('../model/utxo');

//Filter Labels
function findlabel(address) {
  //If Burned Addresses are Activ check for the label
  if (config.module.burnAddress.active) {
    const burnAddress = config.module.burnAddress.address.filter(x => (x.address == address))
    if (burnAddress[0]) return burnAddress[0].label
  }
  //If Wallet Labels are Activ check for the label
  if (config.module.AddressLabel.active) {
    const label = config.module.AddressLabel.label.filter(x => (x.address == address))
    if (label[0]) return label[0].label
  }

  return "";
}

/**
 * Build the list of rich addresses from
 * unspent transactions.
 */
async function syncRich() {
  await Rich.deleteMany({});

  const addresses = await UTXO.aggregate([
    { $group: { _id: '$address', sum: { $sum: '$value' } } },
    { $sort: { sum: -1 } },
    { $limit: 100 }
  ]);



  await Rich.insertMany(addresses.map(addr => (
    {
      label: findlabel(addr._id),
      address: addr._id,
      value: addr.sum
    })));
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'rich';
  let code = 0;

  try {
    locker.lock(type);
    await syncRich();
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
