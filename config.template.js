
/**
 * Global configuration object.
 */
const config = {
  'api': {
    'host': 'https://explorer.bulwarkcrypto.com',
    'port': '443',
    'server_port' : '3000',
    'prefix': '/api',
    'timeout': '5s'
  },
  'coinMarketCap': {
    'api': 'http://api.coinmarketcap.com/v1/ticker/',
    'ticker': 'bulwark'
  },
  'db': {
    'host': '127.0.0.1',
    'port': '27017',
    'name': 'blockex',
    'user': 'blockexuser',
    'pass': 'Explorer!1'
  },
  'freegeoip': {
    'api': 'https://extreme-ip-lookup.com/json/'
  },
  'rpc': {
    'host': '127.0.0.1',
    'port': '52541',
    'user': 'bulwarkrpc',
    'pass': 'someverysafepassword',
    'timeout': 8000, // 8 seconds
  },
  'dnsseed': {
    'path' : './data/seeds/dnsseed.dump',
    'coin' : 'ccbc'
  },
  'module':
  {
    'burnAddress': {
      'active': true,
      'address': [
        { 'label': 'CryptoCashBack Burn Address', 'address': 'SbUrNmfY8pfDVLNtXsedwLTz1QY481hEBn', 'comment': 'Burned Supply from Development Team, these coins are lost' }
      ],
    },
    'AddressLabel': {
      'active': true,
      'label': [
        { 'label': 'Rich Filthy Bastard....', 'address': 'SddsBnNUsabrs2xjEUx63PsmZe2XsKghHK', 'comment': 'Just another Gready Guy' },
      ]
    }
  },
};

module.exports = config;
