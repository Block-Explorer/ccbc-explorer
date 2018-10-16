
const params = {
    LAST_POW_BLOCK: 200, //182700, // 345600
    RAMP_TO_BLOCK: 960,
    LAST_SEESAW_BLOCK: 175000,
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

    let mNodeCoins = nMasternodeCount * params.MASTERNODE_COLLETERAL;

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
    } else {
        if (mNodeCoins === 0) {
            ret = 0;
        } else {

            //```````````````````````````````````//
            //          SEESAW HERE              //
            //,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,//
            if (nHeight <= 250000) {
                if (mNodeCoins <= (nMoneySupply * .05) && mNodeCoins > 0) {
                    ret = blockValue * .85;
                } else if (mNodeCoins <= (nMoneySupply * .1) && mNodeCoins > (nMoneySupply * .05)) {
                    ret = blockValue * .8;
                } else if (mNodeCoins <= (nMoneySupply * .15) && mNodeCoins > (nMoneySupply * .1)) {
                    ret = blockValue * .75;
                } else if (mNodeCoins <= (nMoneySupply * .2) && mNodeCoins > (nMoneySupply * .15)) {
                    ret = blockValue * .7;
                } else if (mNodeCoins <= (nMoneySupply * .25) && mNodeCoins > (nMoneySupply * .2)) {
                    ret = blockValue * .65;
                } else if (mNodeCoins <= (nMoneySupply * .3) && mNodeCoins > (nMoneySupply * .25)) {
                    ret = blockValue * .6;
                } else if (mNodeCoins <= (nMoneySupply * .35) && mNodeCoins > (nMoneySupply * .3)) {
                    ret = blockValue * .55;
                } else if (mNodeCoins <= (nMoneySupply * .4) && mNodeCoins > (nMoneySupply * .35)) {
                    ret = blockValue * .5;
                } else if (mNodeCoins <= (nMoneySupply * .45) && mNodeCoins > (nMoneySupply * .4)) {
                    ret = blockValue * .45;
                } else if (mNodeCoins <= (nMoneySupply * .5) && mNodeCoins > (nMoneySupply * .45)) {
                    ret = blockValue * .4;
                } else if (mNodeCoins <= (nMoneySupply * .55) && mNodeCoins > (nMoneySupply * .5)) {
                    ret = blockValue * .35;
                } else if (mNodeCoins <= (nMoneySupply * .6) && mNodeCoins > (nMoneySupply * .55)) {
                    ret = blockValue * .3;
                } else if (mNodeCoins <= (nMoneySupply * .65) && mNodeCoins > (nMoneySupply * .6)) {
                    ret = blockValue * .25;
                } else if (mNodeCoins <= (nMoneySupply * .7) && mNodeCoins > (nMoneySupply * .65)) {
                    ret = blockValue * .2;
                } else if (mNodeCoins <= (nMoneySupply * .75) && mNodeCoins > (nMoneySupply * .7)) {
                    ret = blockValue * .15;
                } else {
                    ret = blockValue * .1;
                }
            } else if (nHeight > 250000) {
                if (mNodeCoins <= (nMoneySupply * .01) && mNodeCoins > 0) {
                    ret = blockValue * .90;
                } else if (mNodeCoins <= (nMoneySupply * .02) && mNodeCoins > (nMoneySupply * .01)) {
                    ret = blockValue * .88;
                } else if (mNodeCoins <= (nMoneySupply * .03) && mNodeCoins > (nMoneySupply * .02)) {
                    ret = blockValue * .87;
                } else if (mNodeCoins <= (nMoneySupply * .04) && mNodeCoins > (nMoneySupply * .03)) {
                    ret = blockValue * .86;
                } else if (mNodeCoins <= (nMoneySupply * .05) && mNodeCoins > (nMoneySupply * .04)) {
                    ret = blockValue * .85;
                } else if (mNodeCoins <= (nMoneySupply * .06) && mNodeCoins > (nMoneySupply * .05)) {
                    ret = blockValue * .84;
                } else if (mNodeCoins <= (nMoneySupply * .07) && mNodeCoins > (nMoneySupply * .06)) {
                    ret = blockValue * .83;
                } else if (mNodeCoins <= (nMoneySupply * .08) && mNodeCoins > (nMoneySupply * .07)) {
                    ret = blockValue * .82;
                } else if (mNodeCoins <= (nMoneySupply * .09) && mNodeCoins > (nMoneySupply * .08)) {
                    ret = blockValue * .81;
                } else if (mNodeCoins <= (nMoneySupply * .10) && mNodeCoins > (nMoneySupply * .09)) {
                    ret = blockValue * .80;
                } else if (mNodeCoins <= (nMoneySupply * .11) && mNodeCoins > (nMoneySupply * .10)) {
                    ret = blockValue * .79;
                } else if (mNodeCoins <= (nMoneySupply * .12) && mNodeCoins > (nMoneySupply * .11)) {
                    ret = blockValue * .78;
                } else if (mNodeCoins <= (nMoneySupply * .13) && mNodeCoins > (nMoneySupply * .12)) {
                    ret = blockValue * .77;
                } else if (mNodeCoins <= (nMoneySupply * .14) && mNodeCoins > (nMoneySupply * .13)) {
                    ret = blockValue * .76;
                } else if (mNodeCoins <= (nMoneySupply * .15) && mNodeCoins > (nMoneySupply * .14)) {
                    ret = blockValue * .75;
                } else if (mNodeCoins <= (nMoneySupply * .16) && mNodeCoins > (nMoneySupply * .15)) {
                    ret = blockValue * .74;
                } else if (mNodeCoins <= (nMoneySupply * .17) && mNodeCoins > (nMoneySupply * .16)) {
                    ret = blockValue * .73;
                } else if (mNodeCoins <= (nMoneySupply * .18) && mNodeCoins > (nMoneySupply * .17)) {
                    ret = blockValue * .72;
                } else if (mNodeCoins <= (nMoneySupply * .19) && mNodeCoins > (nMoneySupply * .18)) {
                    ret = blockValue * .71;
                } else if (mNodeCoins <= (nMoneySupply * .20) && mNodeCoins > (nMoneySupply * .19)) {
                    ret = blockValue * .70;
                } else if (mNodeCoins <= (nMoneySupply * .21) && mNodeCoins > (nMoneySupply * .20)) {
                    ret = blockValue * .69;
                } else if (mNodeCoins <= (nMoneySupply * .22) && mNodeCoins > (nMoneySupply * .21)) {
                    ret = blockValue * .68;
                } else if (mNodeCoins <= (nMoneySupply * .23) && mNodeCoins > (nMoneySupply * .22)) {
                    ret = blockValue * .67;
                } else if (mNodeCoins <= (nMoneySupply * .24) && mNodeCoins > (nMoneySupply * .23)) {
                    ret = blockValue * .66;
                } else if (mNodeCoins <= (nMoneySupply * .25) && mNodeCoins > (nMoneySupply * .24)) {
                    ret = blockValue * .65;
                } else if (mNodeCoins <= (nMoneySupply * .26) && mNodeCoins > (nMoneySupply * .25)) {
                    ret = blockValue * .64;
                } else if (mNodeCoins <= (nMoneySupply * .27) && mNodeCoins > (nMoneySupply * .26)) {
                    ret = blockValue * .63;
                } else if (mNodeCoins <= (nMoneySupply * .28) && mNodeCoins > (nMoneySupply * .27)) {
                    ret = blockValue * .62;
                } else if (mNodeCoins <= (nMoneySupply * .29) && mNodeCoins > (nMoneySupply * .28)) {
                    ret = blockValue * .61;
                } else if (mNodeCoins <= (nMoneySupply * .30) && mNodeCoins > (nMoneySupply * .29)) {
                    ret = blockValue * .60;
                } else if (mNodeCoins <= (nMoneySupply * .31) && mNodeCoins > (nMoneySupply * .30)) {
                    ret = blockValue * .59;
                } else if (mNodeCoins <= (nMoneySupply * .32) && mNodeCoins > (nMoneySupply * .31)) {
                    ret = blockValue * .58;
                } else if (mNodeCoins <= (nMoneySupply * .33) && mNodeCoins > (nMoneySupply * .32)) {
                    ret = blockValue * .57;
                } else if (mNodeCoins <= (nMoneySupply * .34) && mNodeCoins > (nMoneySupply * .33)) {
                    ret = blockValue * .56;
                } else if (mNodeCoins <= (nMoneySupply * .35) && mNodeCoins > (nMoneySupply * .34)) {
                    ret = blockValue * .55;
                } else if (mNodeCoins <= (nMoneySupply * .363) && mNodeCoins > (nMoneySupply * .35)) {
                    ret = blockValue * .54;
                } else if (mNodeCoins <= (nMoneySupply * .376) && mNodeCoins > (nMoneySupply * .363)) {
                    ret = blockValue * .53;
                } else if (mNodeCoins <= (nMoneySupply * .389) && mNodeCoins > (nMoneySupply * .376)) {
                    ret = blockValue * .52;
                } else if (mNodeCoins <= (nMoneySupply * .402) && mNodeCoins > (nMoneySupply * .389)) {
                    ret = blockValue * .51;
                } else if (mNodeCoins <= (nMoneySupply * .415) && mNodeCoins > (nMoneySupply * .402)) {
                    ret = blockValue * .50;
                } else if (mNodeCoins <= (nMoneySupply * .428) && mNodeCoins > (nMoneySupply * .415)) {
                    ret = blockValue * .49;
                } else if (mNodeCoins <= (nMoneySupply * .441) && mNodeCoins > (nMoneySupply * .428)) {
                    ret = blockValue * .48;
                } else if (mNodeCoins <= (nMoneySupply * .454) && mNodeCoins > (nMoneySupply * .441)) {
                    ret = blockValue * .47;
                } else if (mNodeCoins <= (nMoneySupply * .467) && mNodeCoins > (nMoneySupply * .454)) {
                    ret = blockValue * .46;
                } else if (mNodeCoins <= (nMoneySupply * .48) && mNodeCoins > (nMoneySupply * .467)) {
                    ret = blockValue * .45;
                } else if (mNodeCoins <= (nMoneySupply * .493) && mNodeCoins > (nMoneySupply * .48)) {
                    ret = blockValue * .44;
                } else if (mNodeCoins <= (nMoneySupply * .506) && mNodeCoins > (nMoneySupply * .493)) {
                    ret = blockValue * .43;
                } else if (mNodeCoins <= (nMoneySupply * .519) && mNodeCoins > (nMoneySupply * .506)) {
                    ret = blockValue * .42;
                } else if (mNodeCoins <= (nMoneySupply * .532) && mNodeCoins > (nMoneySupply * .519)) {
                    ret = blockValue * .41;
                } else if (mNodeCoins <= (nMoneySupply * .545) && mNodeCoins > (nMoneySupply * .532)) {
                    ret = blockValue * .40;
                } else if (mNodeCoins <= (nMoneySupply * .558) && mNodeCoins > (nMoneySupply * .545)) {
                    ret = blockValue * .39;
                } else if (mNodeCoins <= (nMoneySupply * .571) && mNodeCoins > (nMoneySupply * .558)) {
                    ret = blockValue * .38;
                } else if (mNodeCoins <= (nMoneySupply * .584) && mNodeCoins > (nMoneySupply * .571)) {
                    ret = blockValue * .37;
                } else if (mNodeCoins <= (nMoneySupply * .597) && mNodeCoins > (nMoneySupply * .584)) {
                    ret = blockValue * .36;
                } else if (mNodeCoins <= (nMoneySupply * .61) && mNodeCoins > (nMoneySupply * .597)) {
                    ret = blockValue * .35;
                } else if (mNodeCoins <= (nMoneySupply * .623) && mNodeCoins > (nMoneySupply * .61)) {
                    ret = blockValue * .34;
                } else if (mNodeCoins <= (nMoneySupply * .636) && mNodeCoins > (nMoneySupply * .623)) {
                    ret = blockValue * .33;
                } else if (mNodeCoins <= (nMoneySupply * .649) && mNodeCoins > (nMoneySupply * .636)) {
                    ret = blockValue * .32;
                } else if (mNodeCoins <= (nMoneySupply * .662) && mNodeCoins > (nMoneySupply * .649)) {
                    ret = blockValue * .31;
                } else if (mNodeCoins <= (nMoneySupply * .675) && mNodeCoins > (nMoneySupply * .662)) {
                    ret = blockValue * .30;
                } else if (mNodeCoins <= (nMoneySupply * .688) && mNodeCoins > (nMoneySupply * .675)) {
                    ret = blockValue * .29;
                } else if (mNodeCoins <= (nMoneySupply * .701) && mNodeCoins > (nMoneySupply * .688)) {
                    ret = blockValue * .28;
                } else if (mNodeCoins <= (nMoneySupply * .714) && mNodeCoins > (nMoneySupply * .701)) {
                    ret = blockValue * .27;
                } else if (mNodeCoins <= (nMoneySupply * .727) && mNodeCoins > (nMoneySupply * .714)) {
                    ret = blockValue * .26;
                } else if (mNodeCoins <= (nMoneySupply * .74) && mNodeCoins > (nMoneySupply * .727)) {
                    ret = blockValue * .25;
                } else if (mNodeCoins <= (nMoneySupply * .753) && mNodeCoins > (nMoneySupply * .74)) {
                    ret = blockValue * .24;
                } else if (mNodeCoins <= (nMoneySupply * .766) && mNodeCoins > (nMoneySupply * .753)) {
                    ret = blockValue * .23;
                } else if (mNodeCoins <= (nMoneySupply * .779) && mNodeCoins > (nMoneySupply * .766)) {
                    ret = blockValue * .22;
                } else if (mNodeCoins <= (nMoneySupply * .792) && mNodeCoins > (nMoneySupply * .779)) {
                    ret = blockValue * .21;
                } else if (mNodeCoins <= (nMoneySupply * .805) && mNodeCoins > (nMoneySupply * .792)) {
                    ret = blockValue * .20;
                } else if (mNodeCoins <= (nMoneySupply * .818) && mNodeCoins > (nMoneySupply * .805)) {
                    ret = blockValue * .19;
                } else if (mNodeCoins <= (nMoneySupply * .831) && mNodeCoins > (nMoneySupply * .818)) {
                    ret = blockValue * .18;
                } else if (mNodeCoins <= (nMoneySupply * .844) && mNodeCoins > (nMoneySupply * .831)) {
                    ret = blockValue * .17;
                } else if (mNodeCoins <= (nMoneySupply * .857) && mNodeCoins > (nMoneySupply * .844)) {
                    ret = blockValue * .16;
                } else if (mNodeCoins <= (nMoneySupply * .87) && mNodeCoins > (nMoneySupply * .857)) {
                    ret = blockValue * .15;
                } else if (mNodeCoins <= (nMoneySupply * .883) && mNodeCoins > (nMoneySupply * .87)) {
                    ret = blockValue * .14;
                } else if (mNodeCoins <= (nMoneySupply * .896) && mNodeCoins > (nMoneySupply * .883)) {
                    ret = blockValue * .13;
                } else if (mNodeCoins <= (nMoneySupply * .909) && mNodeCoins > (nMoneySupply * .896)) {
                    ret = blockValue * .12;
                } else if (mNodeCoins <= (nMoneySupply * .922) && mNodeCoins > (nMoneySupply * .909)) {
                    ret = blockValue * .11;
                } else if (mNodeCoins <= (nMoneySupply * .935) && mNodeCoins > (nMoneySupply * .922)) {
                    ret = blockValue * .10;
                } else if (mNodeCoins <= (nMoneySupply * .945) && mNodeCoins > (nMoneySupply * .935)) {
                    ret = blockValue * .09;
                } else if (mNodeCoins <= (nMoneySupply * .961) && mNodeCoins > (nMoneySupply * .945)) {
                    ret = blockValue * .08;
                } else if (mNodeCoins <= (nMoneySupply * .974) && mNodeCoins > (nMoneySupply * .961)) {
                    ret = blockValue * .07;
                } else if (mNodeCoins <= (nMoneySupply * .987) && mNodeCoins > (nMoneySupply * .974)) {
                    ret = blockValue * .06;
                } else if (mNodeCoins <= (nMoneySupply * .99) && mNodeCoins > (nMoneySupply * .987)) {
                    ret = blockValue * .05;
                } else {
                    ret = blockValue * .01;
                }
            } 
        }

    }
    return ret;
};

const getSubsidy = (nHeight = 1) => {
  let nSubsidy = 0.0;

    //Check if Block is Treassury
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
    // If Block is Revive Block
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
    // Not a Revive Block Or Dev Block
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
        } else if (nHeight <= 556800) { //Till max supply           Total coins used 17,882,000
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
