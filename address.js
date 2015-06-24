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

var base_url = 'http://www.canada411.ca/res/';

var getTotalCount = function (err, count) {
    var deferred = Q.defer();
    if (err) {
        deferred.reject(err);
    } else {
        deferred.resolve(count);
    }

    return deferred.promise;
};

var loopResults = function (count) {
    var deferred = Q.defer();

    console.log('COUNT', count);

    var q = Directory.find({}).exists('locality', false).limit(100);
    q.exec(function (err, records) {
        if (err) {
            deferred.reject(err);
        } else {
            console.log(records.length);
            records.forEach(function (record) {
                console.log(base_url + record.phone_raw);
                request.get(base_url + record.phone_raw, function (err, response, body) {

                    if (!err && response.statusCode === 200) {
                        var $ = cheerio.load(body);

                        $('#contact').filter(function () {
                            var data = $(this);

                            Directory.findOne({phone_raw:  new RegExp('^'+record.phone_raw+'$', "i") }, function (err, listing) {
                                if (err) {
                                    deferred.reject(err);
                                }

                                var map = {
                                    phone_raw: record.phone_raw,
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
                        });
                    } else {
                        if (err) {
                            deferred.reject(err);
                        }
                    }
                });
                //deferred.resolve(records);
            });
        }
    });

    return deferred.promise;
};

//Directory.count(({locality: {$exists: false}}), getTotalCount)
//    .then(loopResults)
//    .then(function (records) {
//              console.log('Done');
//              process.exit(1);
//          })
//;

/*
Directory.findOne(({ phone_raw: /^9057280056$/ }), function (err, listing) {
 if(err) console.error(err);
 console.log("Numberss of Directory:", listing);

 });*/


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


function getAddress(index, phone_number, callback) {
    var base_url = 'http://www.canada411.ca/res/';
    request.get(base_url + phone_number, function (err, response, body) {

        if (!err && response.statusCode === 200) {
            var $ = cheerio.load(body);

            $('#contact').filter(function () {
                var data = $(this);

                Directory.findOne({phone_raw:  new RegExp('^'+phone_number+'$', "i") }, function (err, listing) {
                    if (err) {
                        return console.log(err);
                    }
                    if(listing.locality == undefined || listing.locality == null) {
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
                    } else {
                        console.log('Locality already set');
                    }


                });
            });
        } else {
            if (err) {
                return console.error(err);
            }
        }
    });

    if (callback !== undefined) {
        callback();
    }
}