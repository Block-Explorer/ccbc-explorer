require('babel-polyfill');
const config = require('../config');
const { exit } = require('../lib/cron');
const { forEach } = require('p-iteration');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
const fs = require('fs');
const split = require('split');
// Models.
const Seed = require('../model/seed');
/**
 * Get a list from DnssSeeds from the Dnsseeder
 * from freegeopip.net.
 */
async function GetSeeds(){
  const date = moment().utc().startOf('minute').toDate();
  const inserts = [];
  let index = 0;
  return new Promise(function(resolve, reject) {

    console.log("Checking if Config Exists");
    if (!fs.existsSync(config.dnsseed.path)) {
      reject("File Does not exists: " + config.dnsseed.path + " for Scanning");
    } else console.log("file exists");
  
    // Do async job
    fs.createReadStream(config.dnsseed.path)
    .on('error', function (err) {
      reject(error);
    })
    .pipe(split())
    .on('data', function (line) {
      // Explode Line trough regex
      line = line.toString().match(new RegExp("[^\\n\\r\\t ]+", 'g'));
      //Go trough all lines except the first one since it is the header
      if (line) {
        if (index != 0) {
          line
          const address = line[0].match(new RegExp("\\s*(.*)((?::))((?:[0-9]+))\\s*$"));

          let walletversion
          if(line[12]!==null)
            walletversion = line[11]+ " "+line[12]
          else walletversion = line[11]         
          const walletresult = walletversion.match(new RegExp('[^"\s/](.*)[^"\s/]+', 'g'));

          const seed = new Seed({
            ip: address[1],
            port: address[3],
            status: line[1],
            createdAt: date,
            lastScanned: new Date(line[2] * 1000),
            last_2_hours: line[3].substring(0, line[3].length - 1),
            last_8_hours: line[4].substring(0, line[4].length - 1),
            last_1_day: line[5].substring(0, line[5].length - 1),
            last_7_days: line[6].substring(0, line[6].length - 1),
            last_30_days: line[7].substring(0, line[7].length - 1),
            blockheight: line[8],
            svcs: line[9],
            protocol_version: line[10],
            wallet_version: walletresult[0]

          });
          //console.log(seed);
          inserts.push(seed);
  
        }
        index++;
      }
    })
    .on('end', function () {
      resolve(inserts);
    });
})
}

async function getGeoLocation(seeds){
  const newseed = []
  await forEach(seeds, async (seed) => {
    //Get some Extra Data For Location
    const url = `${config.freegeoip.api}${seed.ip}`;
    const geoip = await fetch(url);
    seed.country = geoip.country;
    seed.countryCode = geoip.countryCode;
    seed.timeZone = geoip.region ;
    newseed.push(seed);
  });
  return newseed;
}

async function syncSeeds() {
  
  //Delete all Seeds
  console.log("Delete old Seeds From Database");
  await Seed.deleteMany({});
  let seeds = await GetSeeds()
  seeds = await getGeoLocation(seeds);
    console.log(seeds);
      if (seeds.length) {
        console.log("Insert Results into Database");
        try {
          await Seed.insertMany(seeds).catch((error) => {
            console.log(error.message);
          });

        } catch (e) {
          console.log(e)
        }
      } else console.log("Nothing to Insert Array Empty");

  console.log("Done Add Seed");
};


/**
 * Handle locking.
 */
async function update() {
  const type = 'seed';
  let code = 0;

  try {
    locker.lock(type);
    console.log("Start Syncing Seeds");
    await syncSeeds();
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
