
const express = require('express');
const iquidus = require('../handler/iquidus');
const dnsseeds = require('../handler/dnsseeds');

const router = express.Router();

// Iquidus Explorer routes.
router.get('/getmoneysupply', iquidus.getmoneysupply);
router.get('/getdistribution', iquidus.getdistribution);
router.get('/getaddress/:hash', iquidus.getaddress);
router.get('/getbalance/:hash', iquidus.getbalance);
router.get('/getlasttxs', iquidus.getlasttxs);

// Get Dnsseeder Data
router.get('/getseeds', dnsseeds.getseeds);
router.get('/downloadseeds', dnsseeds.download);
module.exports =  router;
