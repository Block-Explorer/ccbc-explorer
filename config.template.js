
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
  'burnAddress':[
    {'label':'CryptoCashBack Burn Address','address':'SbUrNmfY8pfDVLNtXsedwLTz1QY481hEBn','comment':'Burned Supply from Developmen Team, these coins are lost'},
    {'label':'CryptoCashBack Burn Address','address':'SNAJtneSvRhW14Db7ZsbXVwRcABTAPKnT3','comment':'Burned Supply from Developmen Team, these coins are lost'}
  ]
};

module.exports = config;
