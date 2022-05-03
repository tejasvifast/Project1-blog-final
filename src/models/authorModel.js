const mongoose = require('mongoose');

const authormodel = new mongoose.Schema({
    fname: {
        type: String, required: true, trim: true, //match: [/^[a-zA-Z]+$/, 'is invalid']
    },
    lname: {
        type: String, required: true, trim: true,//match: [/^[a-zA-Z]+$/, 'is invalid']
    },
    title: {
        type: String, required: true, trim: true, enum: ["Mr", "Mrs", "Miss"],
    },
    email: {
        type: String, required: true, trim: true, lowercase: true, unique: true
    },
    password: {
        type: String, required: true, trim: true,lowercase: true, minlength: 6, select: false,
    },

}, { timestamps: true })

module.exports = mongoose.model('author', authormodel);
//hello
