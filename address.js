#!/usr/bin/env node

//db.directories.find( { locality: { $exists: true } }).count()
//db.directories.find( { phone_raw: 9058408431 })
//db.directories.find( { phone: /^\(613\) 332-3293/ })

var _        = require('underscore');
var argv     = require('minimist')(process.argv.slice(2));
var cluster  = require('cluster');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;

var Directory = require('./models/directory');
var functions = require('./functions');
var numCPUs   = require('os').cpus().length;

var limit = argv.limit || 100000;
var skip  = argv.skip || 0;

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

            var rate  = Math.ceil(limit / numCPUs);
            var start = skip + (rate * msg.id);
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
                records.forEach(function (record, index, array) {
                    Directory.getData(record.phone_raw).then(function (listing) {
                        record.update(listing);
                    });
                });
            });
        });
    });
}
