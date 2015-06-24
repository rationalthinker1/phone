var mongoose = require('mongoose');

var directorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, unique: true, required: true, dropDups: true},
    address: {type: String, required: true},
    phone_raw: {type: String, unique: true, required: true, dropDups: true},
    locality: {type: String},
    region: {type: String},
    postal_code: {type: String}
});

module.exports = mongoose.model('Directory', directorySchema);
