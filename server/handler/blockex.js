
const chain = require('../../lib/blockchain');
const { forEach } = require('p-iteration');
const moment = require('moment');
const { rpc } = require('../../lib/cron');
// System models for query and etc.
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const TX = require('../../model/tx');
const UTXO = require('../../model/utxo');
const config = require('../../config');

/**
 * Get transactions and unspent transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = async (req, res) => {
  try {
    // const txs_q1 = TX
    //   .aggregate([
    //     { $match: { 'vout.address': req.params.hash } },
    //     { $sort: { blockHeight: -1 } }
    //   ])
    //   .allowDiskUse(true)
    //   .exec();
    const txs_q1 = TX
    .aggregate([
      {$match: { 'vout.address': req.params.hash } },
      {$project: {
      vout: {$filter: {
          input: '$vout',
          as: 'v',
          cond: {$eq: ['$$v.address', req.params.hash]}
      }},
      _id:1,
      blockHash:1,
      blockHeight:1,
      createdAt:1,
      txId:1,
      version:1,
      vin:1,
    }},
    { $sort: { blockHeight: -1 } }
    ])
      .allowDiskUse(true)
      .exec();

    const utxo_q2 = UTXO
      .aggregate([
        { $match: { address: req.params.hash } },
        { $sort: { blockHeight: -1 } }
      ])
      .allowDiskUse(true)
      .exec();

    let label = ""
    let comment =""

    if (config.module.burnAddress.active) {
      const label_q = config.module.burnAddress.address.filter(x => (x.address == req.params.hash))
      if (label_q[0]) {
        label = label_q[0].label
        comment = label_q[0].comment
      } 
    }

    if (config.module.AddressLabel.active) {
      const label_q = config.module.AddressLabel.label.filter(x => (x.address == req.params.hash))
      if (label_q[0]) {
        label = label_q[0].label
        comment = label_q[0].comment
      } 
    }

    const txs = await txs_q1;
    const utxo = await utxo_q2;

    const balance = utxo.reduce((acc, tx) => acc + tx.value, 0.0);
    const received = txs.reduce((acc, tx) => acc + tx.vout.reduce((a, t) => a + t.value, 0.0), 0.0);

    res.json({ balance, label, comment, received, txs, utxo });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Will return the average block time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgBlockTime = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = 60.0;
  let cutOff = moment().utc().add(60, 'seconds').unix();
  let loading = true;

  // Generate the average.
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocks = await Block.find({ createdAt: { $gt: date } });
      const seconds = 24 * 60 * 60;

      cache = seconds / blocks.length;
      cutOff = moment().utc().add(60, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(!cache ? 0.0 : cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Will return the average masternode payout time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgMNTime = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = 24.0;
  let cutOff = moment().utc().add(5, 'minutes').unix();
  let loading = true;

  // Generate the average.
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocks = await Block.find({ createdAt: { $gt: date } });
      const mns = await Masternode.find();

      cache = (24.0 / (blocks.length / mns.length));
      cutOff = moment().utc().add(5, 'minutes').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(cache || 0.0);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Get block by hash or height.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlock = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { hash: req.params.hash }
      : { height: req.params.hash };
    const block = await Block.findOne(query);
    if (!block) {
      res.status(404).send('Unable to find the block!');
      return;
    }

    const txs = await TX.find({ txId: { $in: block.txs } });

    res.json({ block, txs });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return the coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoin = (req, res) => {
  Coin.findOne()
    .sort({ createdAt: -1 })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get history of coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinHistory = (req, res) => {
  Coin.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 12) // 12x5=60 mins
    .sort({ createdAt: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return all the coins for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getCoins = async () => {
    loading = true;

    try {
      const start = moment().utc().subtract(8, 'days').toDate();
      const end = moment().utc().toDate();
      const qry = [
        // Select last 7 days of coins.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { createdAt: 1 } }
      ];

      cache = await Coin.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getCoins();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getCoins();
    }
  };
};

/**
 * Will return true if a block hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getIsBlock = async (req, res) => {
  try {
    let isBlock = false;

    // Search for block hash.
    const block = await Block.findOne({ hash: req.params.hash });
    if (block) {
      isBlock = true;
    }

    res.json(isBlock);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodes = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await Masternode.find().sort({ lastPaidAt: -1, status: 1 }).count();
    const mns = await Masternode.find().skip(skip).limit(limit).sort({ lastPaidAt: -1, status: 1 });

    res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get a masternode by wallet adress hash from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeByAddress = async (req, res) => {
  try {
    const hash = req.params.hash;
    const mns = await Masternode.findOne({ addr: hash });

    res.json({ mns });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeCount = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ createdAt: -1 });

    res.json({ enabled: coin.mnsOn, total: coin.mnsOff + coin.mnsOn });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the list of peers from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeer = (req, res) => {
  Peer.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 500)
    .sort({ ip: 1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get coin supply information for usage.
 * https://github.com/coincheckup/crypto-supplies
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getSupply = async (req, res) => {
  try {
    let total_supply = 0
    let masternode_locked = 0  // All Coins locked up from Masternodes
    let burned_coins = 0 //Coins which have been Burned

    //Get the Masternode Count
    const coin_q = Coin.findOne().sort({ createdAt: -1 });

    const utxo_q = UTXO.aggregate([
      { $group: { _id: 'supply', total: { $sum: '$value' } } }
    ]);

    coin = await coin_q
    utxo = await utxo_q

    total_supply = utxo[0].total;
    masternode_locked = (coin.mnsOff + coin.mnsOn) * chain.mncoins  // All Coins locked up from Masternodes
    burned_coins = coin.burned; //Coins which have been Burned

    circulation_supply = total_supply - masternode_locked - burned_coins //Total supply - Burned Coins and Colleteral locked

    //res.json({ t:total_supply ,masternode_locked , burned_coins, c:circulation_supply});
    res.json({ total_supply, masternode_locked, burned_coins, circulation_supply });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the top 100 addresses from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTop100 = (req, res) => {
  Rich.find()
    .limit(100)
    .sort({ value: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = (req, res) => {
  TX.find()
    .limit(10)
    .sort({ blockHeight: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return the transaction information for given hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTX = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { txId: req.params.hash }
      : { height: req.params.hash };
    const tx = await TX.findOne(query);
    if (!tx) {
      res.status(404).send('Unable to find the transaction!');
      return;
    }

    // Get the transactions that are found in the
    // vin section of the tx.
    const vin = [];
    await forEach(tx.vin, async (vi) => {
      if (vi.txId) {
        const t = await TX.findOne({ txId: vi.txId });
        if (!!t) {
          t.vout.forEach((vo) => {
            if (vo.n === vi.vout) {
              vin.push({ address: vo.address, value: vo.value });
            }
          });
        }
      } else if (vi.coinbase) {
        vin.push(vi);
      }
    });

    res.json({ ...tx.toObject(), vin });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXs = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await TX.find({ $nor: [{
      "vin.address": "Generated",
      "vin.value": "0"
  }]}).sort({ blockHeight: -1 }).count();
    const txs = await TX.find({
      $nor: [{
        "vin.address": "Generated",
        "vin.value": "0"
    }]
    }).skip(skip).limit(limit).sort({ blockHeight: -1 });

    res.json({ txs, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return all the transactions for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getTXs = async () => {
    loading = true;

    try {
      const start = moment().utc().startOf('day').subtract(7, 'days').toDate();
      const end = moment().utc().endOf('day').subtract(1, 'days').toDate();
      const qry = [
        // Select last 7 days of txs.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Convert createdAt date field to date string.
        { $project: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
        // Group by date string and build total/sum.
        { $group: { _id: '$date', total: { $sum: 1 } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { _id: 1 } }
      ];

      cache = await TX.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getTXs();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getTXs();
    }
  };
};

module.exports = {
  getAddress,
  getAvgBlockTime,
  getAvgMNTime,
  getBlock,
  getCoin,
  getCoinHistory,
  getCoinsWeek,
  getIsBlock,
  getMasternodes,
  getMasternodeByAddress,
  getMasternodeCount,
  getPeer,
  getSupply,
  getTop100,
  getTXLatest,
  getTX,
  getTXs,
  getTXsWeek
};
