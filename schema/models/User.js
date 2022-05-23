const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Paginate = require('mongoose-paginate-v2');


const user = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_name: { type: String, required: true },
    mail: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    position: { type: String },
    image_name: { type: String },
    image_src: { type: String },
    create_At: { type: Date, default: new Date().toISOString() },
    update_At: { type: Date, default: new Date().toISOString() },
    status: { type: Boolean, default: false },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
}, { _id: false });

user.plugin(uniqueValidator);
user.plugin(Paginate);

const model = mongoose.model('User', user);
module.exports = model;

