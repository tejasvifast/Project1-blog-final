const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")

let keyValid = function (value) {
    if (typeof (value) == "undefined") { return true }
    if (typeof (value) === "string" && value.trim().length == 0) { return true }
    return false
}

let createAuthor = async (req, res) => {
    try {
        data = req.body
        const { fname, lname, title, email, password } = data
        
        if (!fname) return res.status(400).send({ status: false, msg: "fname is required...." });
        if (keyValid(fname)) return res.status(400).send({ status: false, msg: "fname should be valid" })

        if (!lname) return res.status(400).send({ status: false, msg: "lname is required...." });
        if (keyValid(lname)) return res.status(400).send({ status: false, msg: "lname should be valid" })

        if (!title) return res.status(400).send({ status: false, msg: "title is required...." });
        if (keyValid(title)) return res.status(400).send({ status: false, msg: "title should be valid" })

        if (!email) return res.status(400).send({ status: false, msg: "email is required...." });
        if (keyValid(email)) return res.status(400).send({ status: false, msg: "email should be valid" })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, msg: "Invalid email format" })
        
        if (!password) return res.status(400).send({ status: false, msg: "password is required....." });
        if (keyValid(password)) return res.status(400).send({ status: false, msg: "password should be valid" })

        const validEmail = await authorModel.findOne({ email: email })
        if (validEmail) return res.status(400).send({ status: false, msg: "Email already exist" })

        const createdAuthor = await authorModel.create(data)
        return res.status(201).send({ status: true, data: createdAuthor })
    }
    catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let loginAuthor = async (req, res) => {
    let data = req.body
    let { email, password } = data
    let validAuthor = await authorModel.findOne({ email: email, password: password })
    if (!validAuthor) return res.status(400).send({ status: false, msg: "Wrong login details" })
    let authorId = validAuthor._id
    let token = await jwt.sign({ authorId: authorId }, "functionUp project1Blog")
    res.setHeader("X-api-token", token)
    res.status(201).send({ status: true, data: token })
}

module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
