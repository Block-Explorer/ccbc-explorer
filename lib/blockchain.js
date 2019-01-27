
const params = {
    LAST_POW_BLOCK: 200, //182700, // 345600
    RAMP_TO_BLOCK: 960,
    LAST_SEESAW_BLOCK: 1,  //No Seesaw BLock
    TREASSURY_BLOCK_START:60000,
    TREASSURY_BLOCK_STEP:1440,
    REVIVE_BLOCK_START:60001,
    REVIVE_BLOCK_STEP:1440,
  };

const avgBlockTime = 60; // 1.0 minutes (60 seconds)

const blocksPerDay = (24 * 60 * 60) / avgBlockTime; // 1440

const blocksPerWeek = blocksPerDay * 7; // 10080

const blocksPerMonth = (blocksPerDay * 365.25) / 12; // 43830

const blocksPerYear = blocksPerDay * 365.25; // 525960

const mncoins = 25000.0;

const getMNBlocksPerDay = (mns) => {
  return blocksPerDay / mns;
};

const getMNBlocksPerWeek = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 52);
};

const getMNBlocksPerMonth = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 12);
};

const getMNBlocksPerYear = (mns) => {
  return getMNBlocksPerDay(mns) * 365.25;
};

const getMNSubsidy = (nHeight = 0, nMasternodeCount = 0, nMoneySupply = 0) => {
    const blockValue = getSubsidy(nHeight);
    let ret = 0.0;

    if ((nHeight - params.TREASSURY_BLOCK_START) % params.REVIVE_BLOCK_STEP == 0)
        ret = blockValue * 0;
    else if ((nHeight - params.REVIVE_BLOCK_START) % params.REVIVE_BLOCK_STEP == 0)
        ret = blockValue * 0;
    else if (nHeight == 0) {
        ret = blockValue * 0;
    } else if (nHeight <= 25000 && nHeight > 200) {
        ret = blockValue / 10 * 6; //60%
    } else if (nHeight <= 60000 && nHeight > 25000) {
        ret = blockValue / 10 * 6; //60%
    } else if (nHeight <= 65000 && nHeight > 60000) {
        ret = blockValue / 10 * 6.5; //65%
    } else if (nHeight <= 70000 && nHeight > 65000) {
        ret = blockValue / 10 * 6.6; //66%
    } else if (nHeight <= 75000 && nHeight > 70000) {
        ret = blockValue / 10 * 6.7; //67%
    } else if (nHeight <= 80000 && nHeight > 75000) {
        ret = blockValue / 10 * 6.8; //68%
    } else if (nHeight <= 85000 && nHeight > 80000) {
        ret = blockValue / 10 * 6.9; //69%
    } else if (nHeight <= 88000 && nHeight > 85000) {
        ret = blockValue / 10 * 7; //70%
    } else if (nHeight <= 91000 && nHeight > 88000) {
        ret = blockValue / 10 * 7.2; //72%
    } else if (nHeight <= 94000 && nHeight > 91000) {
        ret = blockValue / 10 * 7.4; //74%
    } else if (nHeight <= 97000 && nHeight > 94000) {
        ret = blockValue / 10 * 7.6; //76%
    } else if (nHeight <= 100000 && nHeight > 97000) {
        ret = blockValue / 10 * 7.8; //78%
    } else if (nHeight <= 125000 && nHeight > 100000) {
        ret = blockValue / 10 * 8; //80%
    } else if (nHeight <= 150000 && nHeight > 125000) {
        ret = blockValue / 10 * 8.5; //85%
    } else if (nHeight <= 175000 && nHeight > 150000) {
        ret = blockValue / 10 * 9; //90%
    } else if (nHeight > 175000) {
        ret = blockValue / 10 * 9; //90%
    }

    return ret;
};

const getSubsidy = (nHeight = 1) => {
  let nSubsidy = 0.0;

    //################################################
    //#  Treassury Block  (Dev Fee Goes to Tfinch)   #
    //################################################
    if ((nHeight - params.TREASSURY_BLOCK_START) % params.REVIVE_BLOCK_STEP == 0) {
        if (nHeight < 75000 && nHeight > 60000) {
            nSubsidy = 3600; //3,600 aday at 5% 25 coins per block
        } else if (nHeight < 100000 && nHeight > 75000) {
            nSubsidy = 6120; //6,120 aday at 5% 42.5 coins per block
        } else if (nHeight < 125000 && nHeight > 100000) {
            nSubsidy = 5400; //5,400 aday at 5% 37.5 coins per block
        } else if (nHeight < 168000 && nHeight > 125000) {
            nSubsidy = 3600; //3,600 aday at 5% 25 coins per block
        } else if (nHeight < 297600 && nHeight > 168000) {
            nSubsidy = 1800; //1,800 aday at 5% 12.5 coins per block
        } else if (nHeight < 556800 && nHeight > 297600) {
            nSubsidy = 720; //720 aday at 5% 5 coins per block
        } else if (nHeight < 556800) {
            nSubsidy = 360; //720 aday at 5% 2.5 coins per block
        } else {
            nSubsidy = 3600;
        }
    }
    //#############################################
    //#  Revive Block (AQX not anymore)   #
    //#############################################
    else if ((nHeight - params.REVIVE_BLOCK_START) % params.REVIVE_BLOCK_STEP == 0) {
        if (nHeight < 75000 && nHeight > 60000) {
            nSubsidy = 3600; //3,600 aday at 5% 25 coins per block
        } else if (nHeight < 100000 && nHeight > 75000) {
            nSubsidy = 6120; //6,120 aday at 5% 42.5 coins per block
        } else if (nHeight < 125000 && nHeight > 100000) {
            nSubsidy = 5400; //5,400 aday at 5% 37.5 coins per block
        } else if (nHeight < 168000 && nHeight > 125000) {
            nSubsidy = 3600; //3,600 aday at 5% 25 coins per block
        } else if (nHeight < 297600 && nHeight > 168000) {
            nSubsidy = 1800; //1,800 aday at 5% 12.5 coins per block
        } else if (nHeight < 556800 && nHeight > 297600) {
            nSubsidy = 720; //720 aday at 5% 5 coins per block
        } else if (nHeight < 556800) {
            nSubsidy = 360; //720 aday at 5% 2.5 coins per block
        } else {
            nSubsidy = 3600;
        }
    }
    //#############################################
    //#  Regular Block (No Treasury or Revive )   #
    //#############################################
    else {
        if (nHeight == 0) {
            nSubsidy = 1600000;
        } else if (nHeight <= 5 && nHeight > 1) { //First POW phase 
            nSubsidy = 1600000;
        } else if (nHeight <= 200 && nHeight > 1) { //First POW phase 
            nSubsidy = 0;
        } else if (nHeight <= 25000 && nHeight > 200) { //Public phase 17.22 days 24,800 coins
            nSubsidy = 1;
        } else if (nHeight <= 50000 && nHeight > 25000) { //17.36 days            625,000 coins
            nSubsidy = 25;
        } else if (nHeight <= 75000 && nHeight > 50000) { //17.36 days            1,250,000 coins 
            nSubsidy = 50;
        } else if (nHeight <= 100000 && nHeight > 75000) { //17.36 days           2,125,000 coins
            nSubsidy = 85 ;
        } else if (nHeight <= 125000 && nHeight > 100000) { //17.36 days          1,875,000 coins
            nSubsidy = 75;
        } else if (nHeight <= 168000 && nHeight > 125000) { //30 days             2,150,000 coins
            nSubsidy = 50;
        } else if (nHeight <= 297600 && nHeight > 168000) { //90 days             3,240,000 coins
            nSubsidy = 25;
        } else if (nHeight <= 556800 && nHeight > 297600) { //180 days            2,592,000 coins
            nSubsidy = 10;
        } else if (nHeight >= 556800) { //Till max supply           Total coins used 17,882,000
            nSubsidy = 5;       //57,026.38 days will max supply is reached
        } else nSubsidy = 0; // <-- This will need some Fix but i have to understand more of that Calculation
    }

  return nSubsidy;
};

const getROI = (subsidy, mns) => {
  return ((getMNBlocksPerYear(mns) * subsidy) / mncoins) * 100.0;
};

const isAddress = (s) => {
  return typeof(s) === 'string' && s.length === 34;
};

const isBlock = (s) => {
  return !isNaN(s) || (typeof(s) === 'string');
};

const isPoS = (b) => {
  return !!b && b.height > params.LAST_POW_BLOCK; // > 182700
};

const isTX = (s) => {
  return typeof(s) === 'string' && s.length === 64;
};

module.exports = {
  avgBlockTime,
  blocksPerDay,
  blocksPerMonth,
  blocksPerWeek,
  blocksPerYear,
  mncoins,
  params,
  getMNBlocksPerDay,
  getMNBlocksPerMonth,
  getMNBlocksPerWeek,
  getMNBlocksPerYear,
  getMNSubsidy,
  getSubsidy,
  getROI,
  isAddress,
  isBlock,
  isPoS,
  isTX
};
