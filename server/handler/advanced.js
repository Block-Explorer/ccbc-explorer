// System models for query and etc.
const config = require('../../config');
const UTXO = require('../../model/utxo');

/**
 * Get a List of all Burn Addresses and Burned coins
 */
const getBurnAddresses = async (req, res) => {
    try {
        const BurnAddress = await UTXO.aggregate([
            { "$match": { "address": { $in: config.module.burnAddress.address.map(obj => { return obj.address }) } } },
            { $group: { _id: '$address', sum: { $sum: '$value' } } },
        ]);
        if (BurnAddress[0] != null)
        {
           
            res.json(BurnAddress.map(obj => {
               return [ {address : obj._id , burned_coins:obj.sum }] 
            })  );
        }        
        else res.status(500).send(err.message || err);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
* Get a Burned Coins Summary
*/
const getBurnedCoins = async (req, res) => {
    try {
        const BurnedCoins = await UTXO.aggregate([
            { "$match": { "address": { $in: config.module.burnAddress.address.map(obj => { return obj.address }) } } },
            { $group: { _id: 'all', sum: { $sum: '$value' } } },
        ]);
        if (BurnedCoins[0] != null)
            res.json({ burned_coins: BurnedCoins[0].sum });
        else res.status(500).send(err.message || err);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};


module.exports = {
    getBurnAddresses,
    getBurnedCoins
};
