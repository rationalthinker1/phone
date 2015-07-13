#!/usr/bin/env node

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

//Directory.findOne({phone_raw: '9057850474'}, function(err, doc) {
//    if (err) {
//        return err;
//    }
//    else {
//        console.log(doc);
//    }
//});