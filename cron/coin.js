
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const UTXO = require('../model/utxo');

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function syncCoin() {
  const date = moment().utc().startOf('minute').toDate();
  //#########################################
  //#     Coin Market Cap Wait for List     #
  //#########################################
  // Setup the coinmarketcap.com api url.
  // const url = `${ config.coinMarketCap.api }${ config.coinMarketCap.ticker }?convert=BTC`;
  // let market = await fetch(url);

  const info = await rpc.call('getinfo');
  const masternodes = await rpc.call('getmasternodecount');
  const nethashps = await rpc.call('getnetworkhashps');

  const results = await UTXO.aggregate([
    { $group: { _id: 'supply', total: { $sum: '$value' } } }
  ]);

  //#########################################
  //#     Get Current BTC $$$ Price         #
  //#########################################
  let btc = await fetch("https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=btc");
  //#########################################
  //#       Fetch Data From CryptoBridge    #
  //#########################################
  let cb = await fetch("https://api.crypto-bridge.org/api/v1/ticker/CCBC_BTC");
  console.log("BTC Price / Coin %s",cb.last);


  let market = {
    "USD_Price":cb.last * btc[0].price_usd,
    "USD_Cap": cb.volume * btc[0].price_usd,
    "BTC_Price":cb.last,
    "BTC_Volume":cb.volume
  };

  const coin = new Coin({
    //cap: market.data.quotes.USD.market_cap || 0,
	cap: market.USD_Cap !== null ? market.USD_Cap : 0,
    createdAt: date,
    blocks: info.blocks,
    //btc: market.data.quotes.BTC.price,
	btc: market.BTC_Price !== null ? market.BTC_Price : 0,
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    //supply: results.length ? results[0].total : market.data.circulating_supply || market.data.total_supply,
    supply: results.length ? results[0].total : 0,
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
