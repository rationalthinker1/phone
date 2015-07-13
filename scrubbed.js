#!/usr/bin/env node

var fs       = require('fs');
var argv     = require('minimist')(process.argv.slice(2));
var split    = require('split');
var async    = require('async');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

if(!argv.area_code) {
    console.log('Need area code');
    process.exit(5);
}

var Directory = require('./models/directory');
var functions = require('./functions');
//console.log('DNC/' + argv.area_code + '.csv');
var stream    = fs.createReadStream('DNC/' + argv.area_code + '.csv').pipe(split());
//
//fs.readFile('DNC/' + argv.area_code + '.csv', function read(err, chunk) {
//
//    var phone_raws = chunk.toString().split(/\r?\n/);/*.replace(',', '').trim()*/
//
//
//    async.each(phone_raws, function(phone_raw, callback) {
//        phone_raw = phone_raw.toString().replace(',', '').trim();
//
//        Directory.findOneAndRemove(({ phone_raw: phone_raw }), function(err, removed) {
//
//            console.log(phone_raw, removed, 1);
//        });
//
//        callback();
//    }, function(err){
//        // if any of the file processing produced an error, err would equal that error
//        if( err ) {
//            // One of the iterations produced an error.
//            // All processing will now stop.
//            console.log('A file failed to process');
//        } else {
//            console.log('All files have been processed successfully');
//        }
//    });
//
//
//
//
//    //Directory.findOneAndRemove(({ phone_raw: phone_raw }), function(err, removed) {
//    //
//    //    console.log(phone_raw, removed, 1);
//    //});
//});

//var phone_raw = 9057850474;
//Directory.findOne({ phone_raw: phone_raw }), function (err, doc) {
//    if(err) {
//        console.error(err);
//    }
//
//    if(doc != null) {
//        console.log('Doc:', doc, '; Phone:', phone_raw);
//    }
//});

stream.on('data', function(chunk) {
    var phone_raw = chunk.toString().replace(',', '').trim();
    console.log('Phone:' , phone_raw);
    //Directory.findOne({phone_raw: '9057850474'}, function(err, doc) {
    //    if (err) {
    //        return err;
    //    }
    //    else {
    //        console.log(doc);
    //    }
    //});


    Directory.findOneAndRemove(({ phone_raw: phone_raw }), function(err, removed) {
        if(err) {
            console.error(err);
        }

        if(removed) {
            console.log('Removed:', removed);
        }
    });
});

stream.on('error', function(err) {
    console.error('Error: ', err);
});

stream.on('end', function() {
    console.log('there is no more data.');
    process.exit(1);
});