#!/usr/bin/env node
//node --max_executable_size=2048 --max_old_space_size=6144 app.js 905 0 93

var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
// mongoimport --db directory --collection directories --file phones.json
// mongoexport --db directory --collection directories --out phones8.json
//
// To add a new column:
// db.directories.find({ phone: "(905) 785-0005"}).forEach(function(list) { db.directories.update({ phone: list.phone }, { $set: { phone_raw: list.phone.replace(/[^0-9]/g, '') } }); });
var db = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');
//var p416 = require('./numbers/416');
//var p289 = require('./numbers/289');
//var p905 = require('./numbers/905');
//var p647 = require('./numbers/647');
//var p613 = require('./numbers/613');

var phones = require('./numbers/' + process.argv[2]);

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        worker.send({'id': i});
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    process.on('message', function (msg) {
        db.on('error', console.error);
        db.once('open', function () {

            var rate = parseInt(10000 / numCPUs);
            var start = rate * msg.id;
            var end = start + rate;

            console.log(
                'Worker: ', msg.id, "\n",
                'Start: ', start, "\n",
                'End: ', end, "\n",
                'Rate: ', rate, "\n"
            );

            for (var j = process.argv[3]; j < process.argv[4]; j++) {
                for (var i = start; i < end; i++) {
                    getPhone(j, phones[j] + functions.pad(i, 4), function() {});
                }
            }

            function getPhone(j, phone, cb) {
                var base_url = 'http://www.canada411.ca/res/';
                request.get(base_url + phone, function (err, response, body) {
                    if (!err && response.statusCode === 200) {
                        var $ = cheerio.load(body);

                        $('#contact').filter(function () {
                            var data = $(this);

                            var listing = new Directory({
                                name: data.find('.c411ListedName').first().text()
                                , phone: data.find('.c411Phone').first().text()
                                , address: data.find('.c411Address').first().text().trim()
                                , phone_raw: phone
                            });

                            listing.save(function (err, element) {
                                if (err) return console.log(err);
                                console.log(element);
                            });
                        });
                    } else {
                        if (err) return console.error(err);
                        console.log('code: ' + process.argv[2] + '; index: ' + j + ';No information found for phone:', phone);
                    }
                });

                cb();
            }
        });
    });
}
