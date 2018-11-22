const fs = require('fs');
const split = require('split');
const config = require('../../config');



const getseeds = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
  
  let index = 0;
  let outData = [];
  let readStream = fs.createReadStream(config.dnsseed.path)
    .on('error', function (err) {
      console.log("Caught", err);
      res.status(500).send(err.message || err);
    })
    .pipe(split())
    .on('data', function (line) {
      // Explode Line trough regex
      line = line.toString().match(new RegExp("[^\\n\\r\\t ]+", 'g'));

      //Go trough all lines except the first one since it is the header
      if (line) {
        if (index != 0) {
          let address = line[0].match(new RegExp("[^:]+", 'g'));
          outData.push({
            ipAddress: address[0],
            port: address[1],
            good: line[1],
            lastSuccess: line[2],
            last_2_hours: line[3],
            last_8_hours: line[4],
            last_1_day: line[5],
            last_7_days: line[6],
            last_30_days: line[7],
            blockHeight: line[8],
            svcs: line[9],
            protocoll_version: line[10],
            version: line[11].match("[a-zA-Z:\\d.\\d.\\d]+")[0]
          })
        }
        index++;
      }
    })
    .on('end', function () {
      const total = outData.length;
      //res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit) });
      res.json({ seeds:outData.slice(skip, skip+limit) , pages: total <= limit ? 1 : Math.ceil(total / limit)});
    });
};


const download = async (req, res) => {
  let index = 0;
  let date = new Date(Date.now()).toLocaleString();
  let returnstring = "##########################################\n";
  returnstring += "#    "+config.dnsseed.coin+ " Add Nodes             #\n";
  returnstring += "#  Generated :" + date + "      #\n";
  returnstring += "##########################################\n";

  let readStream = fs.createReadStream(config.dnsseed.path)
    .on('error', function (err) {
      res.status(404).send('Not found');
    })
    .pipe(split())
    .on('data', function (line) {
      // Explode Line trough regex
      line = line.toString().match(new RegExp("[^\\n\\r\\t ]+", 'g'));

      //Go trough all lines except the first one since it is the header
      if (line) {
        if (index != 0) {
          let address = line[0].match(new RegExp("[^:]+", 'g'));
          returnstring += "addnode=" + address[0] + "\n";
        }
        index++;
      }
    })
    .on('end', function () {
      res.setHeader('Content-disposition', 'attachment; filename="' + config.dnsseed.coin + '.config"');
      res.setHeader('Content-type', 'text/plain');
      res.status(200).send(returnstring);
    });

};

module.exports = {
  download,
  getseeds
}