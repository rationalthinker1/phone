var _        = require('underscore');
var cheerio  = require('cheerio');
var request  = require('request');
var mongoose = require('mongoose');
var Q        = require('q');

var directorySchema = new mongoose.Schema({
    name:        {type: String, required: true},
    phone:       {type: String, unique: true, required: true, dropDups: true},
    address:     {type: String, required: true},
    phone_raw:   {type: String, unique: true, required: true, dropDups: true},
    locality:    {type: String},
    region:      {type: String},
    postal_code: {type: String},
    house_type:  {type: String}
});

directorySchema.statics.base_url = 'http://www.canada411.ca/res/';

directorySchema.statics.getData = function (phone_number) {
    var deferred = Q.defer();
    request.get(directorySchema.statics.base_url + phone_number, function (err, response, body) {
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
            });
        } else {
            deferred.reject(err);
        }
    });

    return deferred.promise;
};

directorySchema.statics.saveDirectory = function (listing) {
    var Directory = mongoose.model('Directory', directorySchema);
    var directory   = new Directory(listing);

    directory.save(function (err, element) {
        if (err) {
            return console.log(err);
        }
        console.log(element);
    });
};

directorySchema.methods.update = function (listing) {
    var record =  _.extend(this, listing);
    record.save(function (err, element) {
        if (err) {
            return console.error(err);
        }
        console.log(element);
    });
};

module.exports = mongoose.model('Directory', directorySchema);
