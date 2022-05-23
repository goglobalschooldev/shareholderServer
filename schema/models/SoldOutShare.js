const mongoose = require('mongoose');

const soldOutShare = new mongoose.Schema({
    create_At: { type: Date, default: new Date().toISOString() },
    invoice_Id: String,
    share_Value: Number,
    price: Number,
    start_Id: Number,
    end_Id: Number,
    status: Boolean,
    shareholder: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    share: { type: mongoose.Schema.Types.ObjectId, ref: 'Share' }
});

const model = mongoose.model('SoldOutShare', soldOutShare);
module.exports = model;