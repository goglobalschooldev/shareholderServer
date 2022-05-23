const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate-v2');

const share = new mongoose.Schema({
    create_At: { type: Date, default: new Date().toISOString() },
    update_At: { type: Date, default: new Date().toISOString() },
    type: String,
    total: Number,
    unitPrice: Number,
    sale_Anountment: Number,
    start_Sale_At: Date,
    end_Sale_At: Date,
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    sold_Out_Share: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SoldOutShare' }],
    status: Boolean,
    closing: { type: Boolean, default: false }
})

share.plugin(Paginate);

const model = mongoose.model('Share', share);
module.exports = model;