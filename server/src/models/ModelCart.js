const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema({
    user: { type: String, default: '' },
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
    address: { type: String, default: '' },
    name: { type: String, default: '' },
    phone: { type: Number, default: 0 },
    sumprice: { type: Number, default: 0 },
});

module.exports = mongoose.model('cart', modelCart);
