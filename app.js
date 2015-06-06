//var express = require('express');
//var app = express();
var cheerio = require('cheerio');
var request = require('request');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://127.0.0.1:27017/directory');
db.on('error', console.error);
db.once('open', function() {
	console.log('open');
	var directorySchema = new mongoose.Schema({
		name : String
		, phone : String
		, address: String
	});

	var Directory = mongoose.model('Directory', directorySchema);


	var base_url = 'http://www.canada411.ca/res/';

	var range = function (start, step) {
		var array = [];

		for (var i = 0; i <= step; i++) {
			array[ i ] = start;
			start++;
		}

		return array;
	};
	var phones = range(9057850000, 100);
	for (var i = 0; i < phones.length; i++) {
		request(base_url + phones[ i ], function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var $ = cheerio.load(body);

				$('#contact').filter(function () {
					var data = $(this);

					var listing = new Directory({
						name     : data.find('.c411ListedName').first().text()
						, phone  : data.find('.c411Phone').first().text()
						, address: data.find('.c411Address').first().text().trim()
					});

					listing.save(function (err, thor) {
						if (err) return console.error(err);
						console.dir(thor);
					});
				});
			}
		});
	}
});


//var sleep = require('sleep');
//var port = 3000;


// START THE SERVER
// =============================================================================
//app.listen(port);
//console.log('Magic happens on port ' + port);