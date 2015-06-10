#!/usr/bin/env node

var cheerio = require('cheerio');
var request = require('request');
var mongoose = require('mongoose');
var db = mongoose.connection;

var p416 = require('./numbers/416');
var p289 = require('./numbers/289');
var p905 = require('./numbers/905');
var phones = p905;

var pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

mongoose.connect('mongodb://127.0.0.1:27017/directory');
db.on('error', console.error);
db.once('open', function () {
    console.log('open');

    var directorySchema = new mongoose.Schema({
        name: {type: String, required: true},
        phone: {type: String, unique: true, required: true, dropDups: true},
        address: {type: String, required: true}
    });
    var Directory = mongoose.model('Directory', directorySchema);

    var getPhone = function (phone, cb) {
        var base_url = 'http://www.canada411.ca/res/';
        request(base_url + phone, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var $ = cheerio.load(body);

                $('#contact').filter(function () {
                    var data = $(this);

                    var listing = new Directory({
                        name: data.find('.c411ListedName').first().text()
                        , phone: data.find('.c411Phone').first().text()
                        , address: data.find('.c411Address').first().text().trim()
                    });

                    listing.save(function (err, element) {
                        if (err) return console.error(err);
                        console.dir(element);
                    });
                });
            } else {
                console.log('No information found for phone:', phone);
            }
        });

        cb();
    };

    var initial = process.argv[2];
    var end = process.argv[3];
    for (j = initial; j < end; j++) {
        var i = 0;
        while (i < 10) {
            getPhone(phones[j] + pad(i, 4), function () {
                i++;
            });
        }

        if (j == end) {
            console.log('exit');
            process.exit(0);
        }
    }
});