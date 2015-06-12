#!/usr/bin/env node

var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
// mongoimport --database directory --collections directories --file phones.json
// mongoexport --database directory --collections directories --out phones.json
var db = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');
var p416 = require('./numbers/416');
var p289 = require('./numbers/289');
var p905 = require('./numbers/905');
var phones = p905;

db.on('error', console.error);
db.once('open', function () {
    console.log('Opened the database');

    for (var j = process.argv[2]; j < process.argv[3]; j++) {
        var i = 0;
        while (i < 10000) {
            getPhone(phones[j] + functions.pad(i, 4), function () { i++; });
        }

        //if ((j+1) == process.argv[3]) {
        //    console.log('exit');
        //    process.exit(0);
        //}
    }

    function getPhone(phone, cb) {
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
                    });

                    listing.save(function (err, element) {
                        if (err) return console.error(err);
                        console.dir(element);
                    });
                });
            } else {
                if (err) return console.error(err);
                console.log('No information found for phone:', phone);
            }
        });

        cb();
    }
});