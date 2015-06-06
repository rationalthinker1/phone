var express = require('express');
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var sleep = require('sleep');

var port = 3000;

var base_url = 'http://www.canada411.ca/res/';

var range = function (start, step) {
	var array = [];

	var length = step;

	for (var i = 0; i <= length; i++) {
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
			var json = { name: '', phone: '', address: '' };

			$('#contact').filter(function () {
				var data = $(this);

				json.name = data.find('.c411ListedName').first().text();
				json.phone = data.find('.c411Phone').first().text();
				json.address = data.find('.c411Address').first().text().trim();
			});

			console.log('json: ', json);
		} else {
			
		}
	});
}

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);