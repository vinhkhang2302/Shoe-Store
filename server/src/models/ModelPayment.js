const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPayment = new Schema({
    products: [
        {
            nameProduct: { type: String, default: '' },
            quantity: { type: Number, default: 0 },
            price: { type: Number, default: 0 },
            size: { type: Number, default: 0 },
            img: { type: String, default: '' },
            type: { type: Number, default: 0 },
        },
    ],
    sumprice: { type: Number, default: 0 },
    tinhtrang: { type: Boolean, default: false },
    trangthai: { type: Boolean, default: false },
    phone: { type: Number, default: 0 },
    user: { type: String, default: '' },
    address: { type: String, default: '' },
    size: { type: Number, default: '' },
    username: { type: String },
    typePayments: { type: String, default: 'COD' },
    gatewayOrderId: { type: String, sparse: true, unique: true },
});

module.exports = mongoose.model('payment', modelPayment);
