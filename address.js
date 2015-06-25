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
var numCPUs   = require('os').cpus().length;

var limit = argv.limit || 1000;
var skip  = argv.skip;

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

            var q = Directory.find({}).exists('locality', false).skip(start).limit(end);
            q.exec(function (err, records) {
                var i = start;
                records.forEach(function (element, index, array) {
                    getAddress(i, element.phone_raw, function () {
                        i++;
                    });
                });
            });
        });
    });
}


function getAddress(index, phone_raw, callback) {
    Directory.findOne({phone_raw: new RegExp('^' + phone_raw + '$')}, function (err, listing) {
        if ((listing != undefined) && (listing.locality == undefined)) {
            getRequest(index, phone_raw).then(function (map) {
                console.log(map);
                listing.update({
                    locality:    map.locality,
                    region:      map.region,
                    postal_code: map.postal_code
                }).exec();
                listing.visits.$inc();
                listing.save();
            });
        } else {
            if (listing == undefined) {
                console.log('listing is undefined', listing);
            } else {
                console.log('Locality already set', listing.locality);
            }
        }
    });

    if (callback !== undefined) {
        callback();
    }
}


function getRequest(index, phone_number) {
    var deferred = Q.defer();
    var base_url = 'http://www.canada411.ca/res/';
    request.get(base_url + phone_number, function (err, response, body) {

        if (!err && response.statusCode === 200) {
            var $ = cheerio.load(body);

            $('#contact').filter(function () {
                var data = $(this);

                var map = {
                    index:       index,
                    phone_raw:   phone_number,
                    locality:    data.find('.locality').first().text().trim(),
                    region:      data.find('.region').first().text().trim(),
                    postal_code: data.find('.postal-code').first().text().trim()
                };
                deferred.resolve(map);
            });
        } else {
            if (err) {
                deferred.reject(err);
            }
        }

    });
    return deferred.promise;

}
