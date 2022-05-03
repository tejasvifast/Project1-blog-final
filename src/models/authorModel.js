const mongoose = require('mongoose');

const authormodel = new mongoose.Schema({
    fname: {
        type: String, required: true, trim: true
    },
    lname: {
        type: String, required: true, trim: true
    },
    title: {
        type: String, required: true, trim: true, enum: ["Mr", "Mrs", "Miss"],
    },
    email: {
        type: String, trim: true, lowercase: true, unique: true
    },
    password: {
        type: String, requird: true, trim: true, minlength: 6, select: false,
    },

}, { timestamps: true })

module.exports = mongoose.model('author', authormodel);
//hello
