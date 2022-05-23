const mongoose = require('mongoose');

const property = new mongoose.Schema({
    create_At: { type: Date, default: Date.now.toISOString },
    update_At: { type: Date, default: Date.now.toISOString },
    name: { type: String, required: true },
    description: { type: String },
    mail: { type: String },
    location: { type: String },
    telephone: { type: String },
    website: { type: String },
    logo: { type: String },
    logoSrc: { type: String },
    documents: [{
        name: { type: String },
        display_Name: { type: String },
        src: { type: String }
    }],
})

const model = mongoose.model('Property', property);
module.exports = model;

