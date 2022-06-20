const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

const shareholder = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    create_At: { type: Date },
    update_At: { type: Date },
    first_Name: { type: String, required: 'First Name is required' },
    last_Name: { type: String, required: 'Last Name is required', },
    gender: { type: String },
    status: { type: Boolean, default: false },
    position: { type: String },
    place_of_Birth: { type: String },
    date_of_Birth: Date,
    national_Id: { type: String },
    image_src: { type: String },
    image_name: { type: String },
    documents: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String },
        display_Name: { type: String },
        src: { type: String }
    }],
    contact: {
        mail: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: 'Email address is required',
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        phone_Number: { type: String },
        location: { type: String }
    },
    finger_Print: {
        src: String,
        name: String
    },
    signatur: {
        src: String,
        name: String
    },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
}, { _id: false })

shareholder.plugin(Paginate);
shareholder.plugin(uniqueValidator);
const model = mongoose.model("Shareholder", shareholder);
module.exports = model;