// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express();
var request = require('request');
//var bodyParser = require('body-parser');
//var mongoose   = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var cheerio = require('cheerio');

var port = process.env.PORT || 3000;        // set our port


var base_url = 'http://www.canada411.ca/res/';
//var phone = process.argv[2].replace(/-/g, "");
var phone = 9057850000;

for (var i = 0; i < 100; i++) {
  console.log(phone);
  phone++;

};
process.exit();



// request(base_url + phone, function (error, response, body) {
//   if (!error && response.statusCode === 200) {
//     var $ = cheerio.load(body);

//     var json = { name : '', phone : '', address : '' };

//     $('#contact').filter(function () {

//       // Let's store the data we filter into a variable so we can easily see what's going on.

//       var data = $(this);

//       // In examining the DOM we notice that the title rests within the first child element of the header tag. 
//       // Utilizing jQuery we can easily navigate and get the text by writing the following code:

//       json.name = data.find('.c411ListedName').first().text();
//       json.phone = data.find('.c411Phone').first().text();
//       json.address = data.find('.c411Address').first().text().trim();

//     });

//     console.log('json: ', json);
//   } else {
//     console.log('No phone found');
//   }
//   process.exit();
// });

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);