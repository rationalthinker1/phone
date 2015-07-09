#!/usr/bin/env node

var fs       = require('fs');
var argv     = require('minimist')(process.argv.slice(2));
var split    = require('split');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');
var stream    = fs.createReadStream('DNC/226_raw.txt').pipe(split());

//fs.readFile('DNC/226_raw.txt', function read(err, data) {
//
//    var phone_raw = data.toString().trim();
//
//    Directory.findOne({phone_raw: phone_raw}, function (err, doc) {
//
//        console.log(phone_raw, doc, 1);
//    });
//});

stream.on('data', function(chunk) {
    var phone_raw = chunk.toString().trim();
    Directory.findOne({ phone_raw: phone_raw }, function (err, doc) {
        if(err) {
            console.error(err);
        }

        console.log(doc);
    });
});