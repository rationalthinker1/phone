#!/usr/bin/env node
//node --max_executable_size=2048 --max_old_space_size=6144 app.js 905 0 93
// mongoimport --db directory --collection directories --file phones.json
// mongoexport --db directory --collection directories --out phones8.json
//
// To add a new column:
// db.directories.find({ phone: "(905) 785-0005"}).forEach(function(list) { db.directories.update({ phone: list.phone }, { $set: { phone_raw: list.phone.replace(/[^0-9]/g, '') } }); });

/* Global Requirements */
var cheerio  = require('cheerio');
var request  = require('request');
var async    = require('async');
var cluster  = require('cluster');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

/* Local Requirements */
var Directory = require('./models/directory');
var functions = require('./functions');
var phones    = require('./numbers/' + process.argv[2]);
var numCPUs   = require('os').cpus().length;

var permutation = 10000;

if (cluster.isMaster) {
    /* Forking to creating workers */
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();

        /* Sending a message to each of the workers */
        worker.send({'id': i});
    }

    /* TODO: Master should be working too. */

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    /* Once message has been received */
    process.on('message', function (msg) {
        db.on('error', console.error);
        db.once('open', function () {

            var rate  = parseInt(permutation / numCPUs);
            var start = rate * msg.id;
            var end   = start + rate;

            console.log(
                'Worker: ', msg.id, "\n",
                'Start: ', start, "\n",
                'End: ', end, "\n",
                'Rate: ', rate, "\n"
            );

            /* TODO: Add package minimalist to do individual spectrum of numbers, e.g. 905785.... */
            for (var j = process.argv[3]; j < process.argv[4]; j++) {
                for (var i = start; i < end; i++) {
                    getPhone(j, phones[j] + functions.pad(i, 4));
                }
            }

            function getPhone(index, phone_number, callback) {
                var base_url = 'http://www.canada411.ca/res/';
                request.get(base_url + phone_number, function (err, response, body) {
                    if (!err && response.statusCode === 200) {
                        var $ = cheerio.load(body);

                        $('#contact').filter(function () {
                            var data = $(this);

                            var listing = new Directory({
                                name: data.find('.c411ListedName').first().text(),
                                phone: data.find('.c411Phone').first().text(),
                                address: data.find('.c411Address').first().text().trim(),
                                phone_raw: phone_number
                            });

                            listing.save(function (err, element) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log(element);
                            });
                        });
                    } else {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('code: ' + process.argv[2] + '; index: ' + index + ';No information found for phone number:', phone_number);
                    }
                });

                if (callback !== undefined) {
                    callback();
                }
            }
        });
    });
}
