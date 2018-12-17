const fs = require('fs');
const split = require('split');
const config = require('../../config');
const Seed = require('../../model/seed');
const { forEach } = require('p-iteration');

/**
 * Get the Seeds out of the Database
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getseeds = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await Seed.find().sort({ lastScanned: -1, last_30_days: -1, status:-1 }).count();
    const seeds = await Seed.find().skip(skip).limit(limit).sort({ lastScanned: -1, last_30_days: -1 , status:-1});
    const stats=  await Seed.aggregate([{"$group" : {_id:"$country", count:{$sum:1}}}]);

    res.json({ seeds,stats, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the Seeds out of the Database
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getseedstats = async (req, res) => {
  try {
    const stats = await Seed.aggregate([
      {"$group" : {_id:"$country", count:{$sum:1}}}
    ]);
    res.json({ stats });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the Seeds out of the Database and sends
 * it as an Download
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const downloadseeds = async (req, res) => {
  const date = new Date(Date.now()).toLocaleString();
  let returnstring = "##########################################\n";
  returnstring += "#    " + config.dnsseed.coin + " Add Nodes             #\n";
  returnstring += "#  Generated :" + date + "      #\n";
  returnstring += "##########################################\n";

  try {
    const seeds = await Seed.find().where('status').equals('1');
    await forEach(seeds, async (seed) => {
      returnstring += "addnode=" + seed.ip + "\n";
    });

    res.setHeader('Content-disposition', 'attachment; filename="' + config.dnsseed.coin + '.config"');
    res.setHeader('Content-type', 'text/plain');
    res.status(200).send(returnstring);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

module.exports = {
  downloadseeds,
  getseeds,
  getseedstats
}