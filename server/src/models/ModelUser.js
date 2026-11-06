const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelUser = new Schema({
    fullname: { type: String, require },
    email: { type: String, require },
    password: { type: String, require },
    isAdmin: { type: Boolean, default: false },
    phone: { type: Number, default: 0 },
    address: { type: String, default: '' },
});

module.exports = mongoose.model('user', ModelUser);
