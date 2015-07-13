// Trim address
/*
 db.directories.find({},{ _id: 1, address: 1 }).forEach(function(doc) {
 doc.address = doc.address.trim();
 db.directories.update(
    { "_id": doc._id },
    { "$set": { address: doc.address } },
    function(err, records) {
        printjson(records);
    });
 });
 */
// db.directories.update({}, { $set: { house_type: ''} }, false, true);

var pipeline = [
    { $group: { _id: { address: "$address" }, total: { $sum: 1 } } },
    { $match: { total: { $gt: 50, $lt: 300 } } },
    { $sort: { total: -1 } }
];
var options = { allowDiskUse: true };
db.directories.aggregate(pipeline, options).forEach(function (doc){
    var query = {"address": doc._id.address};
    printjson(doc);
    db.directories.remove(query);
});