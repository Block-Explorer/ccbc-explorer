
import blockchain from '../../../lib/blockchain';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

const CardROI = ({ coin, supply }) => {
  const mncoins = blockchain.mncoins;
  const mns = coin.mnsOff + coin.mnsOn;
  const subsidy = blockchain.getMNSubsidy(coin.blocks, mns, coin.supply);
  const roi = blockchain.getROI(subsidy, coin.mnsOn);

  return (
    <Card>
      <div className="mb-3">
        <div className="h3">
          { coin.mnsOn } / { mns }
        </div>
        <div className="h5">
          Active/Total Masternodes
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          { numeral(roi).format('0,0.0000') }%
        </div>
        <div className="h5">
          Estimated ROI
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          { numeral(supply ? supply.total_supply : 0.0).format('0,0.0000') } CCBC
        </div>
        <div className="h5">
          Coin Supply (Total)
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          { numeral(supply ? supply.circulation_supply : 0.0).format('0,0.0000') } CCBC
        </div>
        <div className="h5">
          Coin Supply (Circulating)
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          {/*I think this is wrong coin cap is usd and coim/btc is price /coin and 
          not bitcoins current price which make the math incorrect
          numeral(coin.cap * coin.btc).format('0,0.00000000') */} 
          {numeral(supply.circulation_supply  * coin.btc).format('0,0.00') }BTC
        </div>
        <div className="h5">
          Market Cap BTC
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          { numeral(coin.cap).format('$0,0.00') }
        </div>
        <div className="h5">
          Market Cap USD
        </div>
      </div>
      <div className="mb-3">
        <div className="h3">
          { numeral(mns * mncoins).format('0,0.0000') } CCBC
        </div>
        <div className="h5">
          Coins Locked
        </div>
      </div>
      {(supply.burned_coins > 0) ? (
      <div className="mb-3">
        <div className="h3 text-red"> 
          { numeral(supply.burned_coins ).format('0,0.0000') } CCBC
        </div>
        <div className="h5">
          Burned Coins (Untouchable)
        </div>
      </div>
      ):null}
      <div className="mb-3">
        <div className="h3">
          { numeral(mncoins * coin.btc).format('0,0.00000000') } BTC / { numeral(mncoins * coin.usd).format('$0,0.00') }
        </div>
        <div className="h5">
          Masternode Worth
        </div>
      </div>
    </Card>
  );
};

CardROI.propTypes = {
  coin: PropTypes.object.isRequired,
  supply: PropTypes.object.isRequired
};

export default CardROI;
