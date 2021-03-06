#!/usr/bin/env node

//nohup node --max_executable_size=2048 --max_old_space_size=8192 app.js --area_code=905 --to=0 --from=5 &
//nohup node --max_executable_size=2048 --max_old_space_size=8192 app.js --phone_range=905785 &
// mongoimport --db directory --collection directories --file phones.json
// mongoexport --db directory --collection directories --out phones8.json
// mongoexport --db directory --collection directories --type=csv --limit=5000 --query "{ locality: 'Barrie' }" --out 5kBarrie.csv --fields name,address,locality,region,postal_code,phone_raw
// mongo directory ./numbers/export.js > count.txt
// cat count.txt | sort -rg > ./numbers/count_sort.txt
//
// To add a new column:
// db.directories.find({ phone: "(905) 785-0005"}).forEach(function(list) { db.directories.update({ phone: list.phone }, { $set: { phone_raw: list.phone.replace(/[^0-9]/g, '') } }); });
// db.directories.find( { address: /^22 Northwood Dr.*/ })

/* Global Requirements */
var cheerio  = require('cheerio');
var request  = require('request');
var async    = require('async');
var Q        = require('q');
var argv     = require('minimist')(process.argv.slice(2));
var cluster  = require('cluster');
var sleep    = require('sleep');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

/* Local Requirements */
var Directory = require('./models/directory');
var functions = require('./functions');
var phones    = (argv.area_code !== undefined) ? require('./numbers/' + argv.area_code) : argv.phone_range;
var numCPUs   = require('os').cpus().length;

/* How many checks will be do? 10^4 */
var permutation = 10000;

if (cluster.isMaster) {
    /* Forking to creating workers */
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();

        /* Sending a message to each of the workers */
        worker.send({'id': i});
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    /* Once message has been received */
    process.on('message', function (msg) {
        db.on('error', console.error);
        db.once('open', function () {

            var rate  = Math.ceil(permutation / numCPUs);
            var start = rate * msg.id;
            var end   = start + rate;

            console.log(
                'Worker: ', msg.id, "\n",
                'Start: ', start, "\n",
                'End: ', end, "\n",
                'Rate: ', rate, "\n",
                'numCPUs: ', numCPUs, "\n"
            );

            if (argv.to !== undefined && argv.from !== undefined) {
                for (var j = argv.to; j < argv.from; j++) {
                    for (var i = start; i < end; i++) {
                        Directory.getData(phones[j] + functions.pad(i, 4)).then(function (listing) {
                            Directory.saveDirectory(listing);
                        });
                    }
                }
            } else {
                for (var k = start; k < end; k++) {
                    Directory.getData(phones + functions.pad(k, 4)).then(function (listing) {
                        Directory.saveDirectory(listing);
                    });
                }
            }
        });
    });
}
