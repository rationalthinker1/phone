#!/usr/bin/env node

var cheerio = require('cheerio');
var request = require('request');
var Q = require('q');
var async = require('async');
var argv = require('minimist')(process.argv.slice(2));
var cluster = require('cluster');
var sleep = require('sleep');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');

/*Directory.count(({ locality: {$exists : false} }), function (err, count) {
    if(err) console.error(err);
    console.log("Number of Directory:", count);

});*/

/*Directory.find({ phone: "(905) 785-0005"}, function (err, records) {
    if(err) console.error(err);
    records.forEach(function (record) {
        console.log('Thing retrieved:' + record);
        process.exit();
    });
});*/

//db.students.find().skip(pageNumber > 0 ? ((pageNumber-1)*nPerPage) : 0).limit(nPerPage).forEach( function(student) { print(student.name + "<p>"); } );


//{ phone: "/\(905\) 785.*/"}


//Directory.find({ phone: /\(905\) 785.*/}).limit(20)
//    .exec(function (err, records) {
//    if(err) console.error(err);
//    var i = 0;
//    records.forEach(function (record) {
//        console.log(i, 'Thing retrieved:' + record);
//        i++;
//    });
//});


var getTotalCount = function (err, count) {
    var deferred = Q.defer();
    if (err) {
        deferred.reject(err, null);
    } else {
        deferred.resolve(null, count);
    }

    return deferred.promise;
};

var loopResults = function (err, count) {
    var deferred = Q.defer();

    console.log('COUNT', count);

    var q = Directory.find({ }).exists('locality', false).limit(100);
    q.exec(function(err, records) {
        if (err) {
            deferred.reject(err, null);
        } else {
            var i = 1;
            records.forEach(function (record) {
                console.log(i, 'Thing retrieved:' + record);
                i++;
            });
            deferred.resolve(null, records);
        }
    });

    return deferred.promise;
};

Directory.count(({ locality: {$exists : false} }), getTotalCount)
    .then(loopResults)
    .then(function(err, records) {
        console.log('Done');
        process.exit(1);
    })
;