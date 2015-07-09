#!/usr/bin/env node

// Trim address
//db.directories.find({},{ _id: 1, address: 1 }).forEach(function(doc) {
//    doc.address = doc.address.trim();
//    db.directories.update(
//        { "_id": doc._id },
//        { "$set": { address: doc.address } }
//    );
//});
// db.directories.update({}, { $set: { house_type: ''} }, false, true);

/*
var pipeline = [
 { $group: { _id: { address: "$address" }, total: { $sum: 1 } } },
 { $match: { total: { $gt: 50, $lt: 300 } } },
 { $sort: { total: -1 } }
 ];
 var options = { allowDiskUse: true };
 db.directories.aggregate(pipeline, options).forEach(function (doc){
 var query = {"address": doc._id};
 db.directories.remove(query);
 });
*/

/*
 * "BENJAMIN","LAU","23 BAYFIELD DR","RICHMOND HILL","ON","L4S2M5","9052370063","90729","40","M","Owner","English","Upscale","University/College","Mixed","<15","Large","After 1996","Mixed House Types"
 "J","HERRING","77722A LONDON RD RR 5","CLINTON","ON","N0M1L0","5194829514","55758","47","U","Owner","English","Middle","High School/Trade","Blue-Collar","<20","Large","Before 1946 & A","Single Detached Houses"
 "JIAN","ZHANG","11 GOLDFINCH CRT","NORTH YORK","ON","M2R2C2","4165196538","40917","44","U","Renter","Non-Official","Middle","University/College","Mixed","<6,25+","Medium","1961-80","High Rise Apartments"
 "D","BOOCOCK","1229 MARLBOROUGH CRT","OAKVILLE","ON","L6H3B6","9058448691","70878","41","U","Renter","Non-Official","Middle","University/College","Mixed","<6,25+","Medium","1961-80","High Rise Apartments"
 "S","WADDELL","7079 YONGE ST","INNISFIL","ON","L9S4N7","7054369747","76924","44","U","Owner","English","Upper-Middle","High School/College","Blue-Collar & Service Sector","Mixed","Large","1971-90","Mixed House Types"
 "HUY","DINH","600 LOLITA GDNS","MISSISSAUGA","ON","L5A3K8","9052324909","52424","41","U","Renter","Non-Official","Middle","University/College","Mixed","<6,25+","Medium","1961-80","High Rise Apartments"
 "RONALD","READ","15 GOVERNORS RD","EAST YORK","ON","M4W2E9","4169249329","231473","48","M","Owner","English","Wealthy","University","White-Collar","24-Oct","Large","Before 1946 & A","Single Detached Houses"
 "L","NGUIEN","22 NORTHWOOD DR","BRAMPTON","ON","L6X2L2","9054871237","76975","40","U","Owner","English","Upscale","University/College","Mixed","<15","Large","After 1996","Mixed House Types"
 "B","KRYSCHUK","87 DEERWOOD CRES","OAK RIDGES","ON","L4E4B4","9057738542","103762","40","U","Owner","English","Upscale","University/College","Mixed","<15","Large","After 1996","Mixed House Types"
 "H","OSMAN","546 THE WEST MALL","ETOBICOKE","ON","M9C1G3","4166266186","55351","43","U","Renter","Non-Official","Middle","High School","Blue-Collar & Service Sector","18+","Large","Before 1970","Mixed House Types & Low Rise Apartments"

 * */

var fs       = require('fs');
var lazy     = require('lazy');
var csv      = require('fast-csv');
var _        = require('underscore');
var argv     = require('minimist')(process.argv.slice(2));
var cluster  = require('cluster');
var mongoose = require('mongoose').connect('mongodb://127.0.0.1:27017/directory');
var db       = mongoose.connection;
var exec     = require('child_process').exec;
var parse    = require('csv-parse');

var Directory = require('./models/directory');
var functions = require('./functions');
var stream    = fs.createReadStream('main.csv');

db.on('error', console.error);
db.once('open', function () {
    csv.fromStream(stream, {ignoreEmpty: true})
        //.transform(function(data, next){
        //    MyModel.findById(data.id, next);
        //})
        .on('data', function (data) {
            //console.log(data[2], data[18]);
            var address = data[2].trim();
            var q       = Directory.findOne({address: {$regex: new RegExp(address, 'i')}});
            q.exec(function (err, record) {
                var house_type = data[18].trim();
                if (record != null && house_type != null && house_type != '') {
                    record.house_type = house_type;
                    record.save(function (err, element) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log(record);
                    });
                }
            });
        })
        .on('end', function () {
            console.log('done');
        });
});