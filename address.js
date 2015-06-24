#!/usr/bin/env node

var cheerio  = require('cheerio');
var request  = require('request');
var Q        = require('q');
var async    = require('async');
var argv     = require('minimist')(process.argv.slice(2));
var cluster  = require('cluster');
var sleep    = require('sleep');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');

var limit = argv.limit || 1000 ;
var skip = argv.skip;

var q = Directory.find({}).limit(limit).skip(skip);
q.exec(function (err, records) {
    var i = skip;
    records.forEach(function(element, index, array) {
        getAddress(i, element.phone_raw, function() {
            i++;
        });
    });
});

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

            var rate  = parseInt(limit / numCPUs);
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
                        getAddress(j, phones[j] + functions.pad(i, 4));
                    }
                }
            } else {
                for (var i = start; i < end; i++) {
                    getPhone(i, phones + functions.pad(i, 4));
                }
            }
        });
    });
}


function getAddress(index, phone_number, callback) {
    Directory.findOne({phone_raw:  new RegExp('^'+phone_number+'$', "i") }, function (err, listing) {
        if(listing.locality == undefined || listing.locality == null) {
            var base_url = 'http://www.canada411.ca/res/';
            request.get(base_url + phone_number, function (err, response, body) {

                if (!err && response.statusCode === 200) {
                    var $ = cheerio.load(body);

                    $('#contact').filter(function () {
                        var data = $(this);

                        var map = {
                            index: index,
                            phone_raw: phone_number,
                            locality: data.find('.locality').first().text().trim(),
                            region: data.find('.region').first().text().trim(),
                            postal_code: data.find('.postal-code').first().text().trim()
                        };
                        console.log(map);

                        listing.locality    = map.locality;
                        listing.region      = map.region;
                        listing.postal_code = map.postal_code;
                        listing.save();
                    });
                } else {
                    if (err) {
                        return console.error(err);
                    }
                }
            });
        } else {
            console.log('Locality already set');
        }
    });


    if (callback !== undefined) {
        callback();
    }
}