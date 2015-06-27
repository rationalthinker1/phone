var cheerio  = require('cheerio');
var request  = require('request');
var mongoose = require('mongoose');
var Q        = require('q');
var _        = require('underscore');
var argv     = require('minimist')(process.argv.slice(2));

var directorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, unique: true, required: true, dropDups: true},
    address: {type: String, required: true},
    phone_raw: {type: String, unique: true, required: true, dropDups: true},
    locality: {type: String},
    region: {type: String},
    postal_code: {type: String}
});

directorySchema.methods.getInformation = function (index, phone_number) {
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
                    locality:    data.find('.locality').first().text().trim(),
                    region:      data.find('.region').first().text().trim(),
                    postal_code: data.find('.postal-code').first().text().trim(),
                    phone_raw:   phone_number
                };

                deferred.resolve(listing);
                var directory = new Directory(listing);

                directory.save(function (err, element) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(element);
                });
            });
        } else {
            if (err) {
                deferred.reject(err);
            }
            console.log('code: ' + ((argv.area_code !== undefined) ? argv.area_code : argv.phone_range) + '; index: ' + index + ';No information found for phone number:', phone_number);
        }
    });

    return deferred.promise;
};

directorySchema.methods.getAddress = function (phone_number) {
    var deferred = Q.defer();
    var base_url = 'http://www.canada411.ca/res/';
    request.get(base_url + phone_number, function (err, response, body) {

        if (!err && response.statusCode === 200) {
            var $ = cheerio.load(body);

            $('#contact').filter(function () {
                var data = $(this);

                var address = {
                    locality:    data.find('.locality').first().text(),
                    region:      data.find('.region').first().text(),
                    postal_code: data.find('.postal-code').first().text()
                };
                deferred.resolve(address);
            });
        } else {
            if (err) {
                deferred.reject(err);
            }
        }

    });
    return deferred.promise;
};

directorySchema.methods.saveListing = function (information) {
    var listing =  _.extend(this, information);
    listing.save(function (err, element) {
        if (err) {
            return console.error(err);
        }
        console.log(element);
    });
};

module.exports = mongoose.model('Directory', directorySchema);
