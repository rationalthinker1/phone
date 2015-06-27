var cheerio  = require('cheerio');
var request  = require('request');
var mongoose = require('mongoose');
var Q        = require('q');

var directorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, unique: true, required: true, dropDups: true},
    address: {type: String, required: true},
    phone_raw: {type: String, unique: true, required: true, dropDups: true},
    locality: {type: String},
    region: {type: String},
    postal_code: {type: String}
});

directorySchema.statics.getData = function getAddress(phone_number) {
    var deferred = Q.defer();
    var base_url = 'http://www.canada411.ca/res/';
    request.get(base_url + phone_number, function (err, response, body) {

        if (!err && response.statusCode === 200) {
            var $ = cheerio.load(body);

            $('#contact').filter(function () {
                var data = $(this);

                var listing = {
                    name:        data.find('.c411ListedName').first().text(),
                    phone:       data.find('.c411Phone').first().text(),
                    address:     data.find('.c411Address').first().text().trim(),
                    locality:    data.find('.locality').first().text(),
                    region:      data.find('.region').first().text(),
                    postal_code: data.find('.postal-code').first().text(),
                    phone_raw:   phone_number
                };
                deferred.resolve(listing);
            });
        } else {
            if (err) {
                deferred.reject(err);
            }
        }

    });
    return deferred.promise;
};

directorySchema.statics.saveDirectory = function saveDirectory(data) {
    "use strict";
    var Directory = mongoose.model('Directory', directorySchema);
    var listing = new Directory(data);

    listing.save(function (err, element) {
        if (err) {
            return console.log(err);
        }
        console.log(element);
    });
};

module.exports = mongoose.model('Directory', directorySchema);
