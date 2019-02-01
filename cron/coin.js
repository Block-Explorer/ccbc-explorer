
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const UTXO = require('../model/utxo');

// function Exchange()
// {
//   switch()
// }

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function syncCoin() {
  const date = moment().utc().startOf('minute').toDate();
  //#########################################
  //#     Get Current BTC $$$ Price         #
  //#########################################
  const btc_q = await fetch("https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=btc");
  //#########################################
  //#       Fetch Data From Exchange        #
  //#########################################
  const cb_q = await fetch("https://api.crypto-bridge.org/api/v1/ticker/CCBC_BTC");
  //#########################################
  //#     Coin Market Cap Wait for List     #
  //#########################################
  const info_q = await rpc.call('getinfo');
  const masternodes_q = await rpc.call('getmasternodecount');
  const nethashps_q = await rpc.call('getnetworkhashps');

  const results_q = await UTXO.aggregate([
    { $group: { _id: 'supply', total: { $sum: '$value' } } }
  ]);

  // we want these Queries to run parallel
  const info = await info_q
  const masternodes =await masternodes_q 
  const nethashps =await nethashps_q
  const results =await results_q 
  const btc = await btc_q
  const cb = await cb_q

  //#########################################
  //#     Get current Burned Coins          #
  //#########################################
  let burned = 0
  if (config.module.burnAddress.active) {
    const BurnAddress = await UTXO.aggregate([
      { "$match": { "address": { $in: config.module.burnAddress.address.map(obj => { return obj.address }) } } },
      { $group: { _id: 'burned', sum: { $sum: '$value' } } },
    ]);
    if (BurnAddress && BurnAddress[0] && BurnAddress[0].sum)  burned = BurnAddress[0].sum
  }

  let coinSupply = 0
  if(results[0]) 
     coinSupply = results[0].total 
  else if (info.moneysupply) 
     coinSupply = info.moneysupply

  let market = {
    "USD_Price": cb.last * btc[0].price_usd,
    "USD_Cap": coinSupply * (cb.last * btc[0].price_usd),
    "Suppply": coinSupply,
    "BTC_Price": cb.last,
    "BTC_Volume": coinSupply * cb.last
  };
  //console.log(market);

  const coin = new Coin({
    burned: burned,
    cap: market.USD_Cap !== null ? market.USD_Cap : 0,
    createdAt: date,
    blocks: info.blocks,
    btc: market.BTC_Price !== null ? market.BTC_Price : 0,
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    //supply: results.length ? results[0].total : market.data.circulating_supply || market.data.total_supply,
    supply:coinSupply,
    //usd: market.data.quotes.USD.price
    usd: market.USD_Price !== null ? market.USD_Price : 0

  });

  await coin.save();
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'coin';
  let code = 0;

  try {
    locker.lock(type);
    await syncCoin();
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
