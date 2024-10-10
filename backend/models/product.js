const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    image: { type: String },
    sold:{ type:Boolean},
    dateOfSale:{type:Date }
});

const ProductModel = mongoose.model('product', ProductSchema)

module.exports = ProductModel