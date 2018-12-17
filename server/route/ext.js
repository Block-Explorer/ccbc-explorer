
const express = require('express');
const iquidus = require('../handler/iquidus');
const { downloadseeds } = require('../handler/dnsseeds');

const router = express.Router();

// Iquidus Explorer routes.
router.get('/getmoneysupply', iquidus.getmoneysupply);
router.get('/getdistribution', iquidus.getdistribution);
router.get('/getaddress/:hash', iquidus.getaddress);
router.get('/getbalance/:hash', iquidus.getbalance);
router.get('/getlasttxs', iquidus.getlasttxs);

//Download Seeds
router.get('/downloadseeds', downloadseeds);

module.exports =  router;
