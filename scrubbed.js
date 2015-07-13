#!/usr/bin/env node

var fs       = require('fs');
var argv     = require('minimist')(process.argv.slice(2));
var split    = require('split');
var async    = require('async');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

if (!argv.area_code) {
    console.log('Need area code');
    console.log('ex: node scrubbed --area_code=416');
    process.exit(1);
}

var Directory = require('./models/directory');
var functions = require('./functions');
var stream    = fs.createReadStream('DNC/' + argv.area_code + '.csv').pipe(split());

stream.on('data', function (chunk) {
    var phone_raw = chunk.toString().replace(',', '').trim();
    Directory.findOneAndRemove(({phone_raw: phone_raw}), function (err, removed) {
        if (err) {
            console.error(err);
        }

        if (removed) {
            console.log('Removed:', removed);
        }
    });
});

stream.on('error', function (err) {
    console.error('Error: ', err);
});

stream.on('end', function () {
    console.log('Done.');
    process.exit(1);
});