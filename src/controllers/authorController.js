const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")
//#################################################################################################################################################
//VALIDATIONS

const keyValid = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == null) { return true }
    if (typeof (value) === "string" && value.trim().length == 0) { return true }
    return false
}
const validTitle = function (value) {
    return ["Mr", "Mrs", "Miss"].indexOf(value.trim()) !== -1
}
const validRequestBody = function(value){
    return Object.keys(value).length > 0
}

//#################################################################################################################################################
const createAuthor = async (req, res) => {
    try {
        const data = req.body
        const { fname, lname, title, email, password } = data
        if(!validRequestBody(data)) return res.status(400).send({status:false,Message:"Invalid Request Parameter ,Please provide Author Details"})

        if (!fname) return res.status(400).send({ status: false, Message: "fname is required...." });
        if (!/^[a-zA-Z ]+$/.test(fname)) return res.status(400).send({ status: false, Message: "fname should be valid" })

        if (!lname) return res.status(400).send({ status: false, Message: "lname is required...." });
        if (!/^[a-zA-Z ]+$/.test(lname)) return res.status(400).send({ status: false, Message: "lname should be valid" })

        if (!title) return res.status(400).send({ status: false, Message: "title is required...." });
        if (!validTitle(title)) return res.status(400).send({ status: false, Message: `${title}  -> title should be valid` })

        if (!email) return res.status(400).send({ status: false, Message: "email is required...." });
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, Message: `${email} -> Invalid email format` })

        if (!password) return res.status(400).send({ status: false, Message: "password is required....." });
        if (keyValid(password)) return res.status(400).send({ status: false, Message: "password should be valid" })

        const alreadyUsedEmail = await authorModel.findOne({ email: email })
        if (alreadyUsedEmail) return res.status(400).send({ status: false, Message: "Email already exist" })

        const createdAuthor = await authorModel.create(data)
        return res.status(201).send({ status: true, Message: "Author Created Sucessfully", data: createdAuthor })
    }
    catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

//#################################################################################################################################################
const loginAuthor = async (req, res) => {
    const data = req.body
    const { email, password } = data
    if(!validRequestBody(data)) return res.status(400).send({status:false,Message:"Invalid Request Parameter ,Please provide Login Details"})
    
    if (!email) return res.status(400).send({ status: false, Message: "email is required...." });
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, Message: "Email Address should be valid" })

    if (!password) return res.status(400).send({ status: false, Message: "password is required....." });
    if (keyValid(password)) return res.status(400).send({ status: false, Message: "password should be valid" })

    const validAuthor = await authorModel.findOne({ email: email, password: password })
    if (!validAuthor) return res.status(400).send({ status: false, Message: "Wrong login Credentials" })

    const authorId = validAuthor._id
    const token = await jwt.sign({ authorId: authorId }, "functionUp project1Blog (@#$%^&)")
    // res.setHeader("X-api-token", token)
    return res.status(201).send({ status: true,Message:"Author Login Successfully", data: {token} })
}

//#################################################################################################################################################
module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
