var mongoose = require('mongoose');

var directorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, unique: true, required: true, dropDups: true},
    address: {type: String, required: true},
    phone_raw: {type: Number, unique: true, required: true, dropDups: true}
});

module.exports = mongoose.model('Directory', directorySchema);
