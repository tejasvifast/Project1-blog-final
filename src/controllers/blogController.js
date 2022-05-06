
const { default: mongoose } = require("mongoose");
const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel")

//#################################################################################################################################################
//VALIDATIONS

const isValidData = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == null) { return true }
    if (typeof (value) === "string" && value.trim().length == 0) { return true }
    return false
}

const isValidRequestBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}

const isValidObjectId = function (authorId) {
    return mongoose.isValidObjectId(authorId)     //mongoose.Types.ObjectId.isValid(authorId)    
}

//#################################################################################################################################################

const createBlog = async (req, res) => {
    try {
        const data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, Message: "Please provide something to create blog" })

        let { authorId, title, body, tags, category, subcategory, isPublished} = data

        if (tags) {
            if (Array.isArray(tags)) tags = tags.map(el => el.trim()).filter(el => el)
            if (Object.prototype.toString.call(tags) === "[object String]") tags = tags.trim()
        }
        if (subcategory) {
            if (Array.isArray(subcategory)) subcategory = subcategory.map(el => el.trim()).filter(el => el)
            if (Object.prototype.toString.call(subcategory) === "[object String]") subcategory = subcategory.trim()
        }
        data.tags = tags
        data.subcategory = subcategory

        if (!title) return res.status(400).send({ Message: "Title is required...!" });
        if (isValidData(title)) return res.status(400).send({ status: false, Message: "title should be valid" })

        if (!authorId) return res.status(400).send({ Message: "authorId is required...!" });
        if (!isValidObjectId(authorId)) return res.status(400).send({ status: false, Message: `${authorId} -> Author Id should be valid` })
        const validAuthorId = await authorModel.findById(authorId)
        if (!validAuthorId) return res.status(400).send({ status: false, Message: "Author Does not exist" })

        if (!body) return res.status(400).send({ Message: "Body is required...!" });
        if (isValidData(body)) return res.status(400).send({ status: false, Message: "body should be valid" })

        if (!category) return res.status(400).send({ Message: "Category is required...!" });
        if (isValidData(category)) return res.status(400).send({ status: false, Message: "category should be valid" })

        const repeativeData = await blogModel.find({ body: body })
        if (!repeativeData.length == 0) return res.status(400).send({ status: false, Message: "you are creating repeative blog again with same body" })

        const createdBlog = await blogModel.create(data)

        isPublished ? createdBlog.publishedAt = new Date() : createdBlog.publishedAt = null
        createdBlog.save()
        return res.status(201).send({ status: true, Message: "New Blog Created Successfully", data: createdBlog })
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//#################################################################################################################################################

const getblog = async (req, res) => {
    try {
        const data = req.query
        const blogs = { isDeleted: false, isPublished: true }
        if (isValidRequestBody(data)) {
            const { authorId, category, tags, subcategory } = data
            if (authorId)
                if (!isValidData(authorId) && isValidObjectId(authorId)) {
                    blogs.authorId = authorId
                }
            if (category)
                if (!isValidData(category)) {
                    blogs.category = category.trim()
                }
            if (tags)
                if (!isValidData(tags)) {
                    const tagsArray = tags.trim().split(",").map(tags => tags.trim())
                    blogs.tags = { $all: tagsArray }
                }
            if (subcategory)
                if (!isValidData(subcategory)) {
                    const subcategoryArray = subcategory.trim().split(",").map(subcategory => subcategory.trim())
                    blogs.subcategory = { $all: subcategoryArray }
                }
        }
        // console.log(blogs)
        const getBlogs = await blogModel.find(blogs)
        if (getBlogs.length == 0) return res.status(400).send({ status: false, Message: "No blog found" })
        return res.status(200).send({ status: true, Message: "Blog list", data: getBlogs })

    }
    catch (err) {
        res.status(500).send({ Error: err.message })
    }
}
//#################################################################################################################################################

const updateBlog = async (req, res) => {
    try {
        const data = req.body
        const blogId = req.params.blogId

        let { title, body, category, subcategory, tags, isPublished } = data

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, Message: "Please provide something to Update blog" })
        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, Message: `${blogId} is not a valid Blog Id` })

        if (tags != undefined) {
            if (Array.isArray(tags)) tags = tags.map(el => el.trim()).filter(el => el)
            if (Object.prototype.toString.call(tags) === "[object String]") tags = tags.trim()
        }

        if (subcategory != undefined) {
            if (Array.isArray(subcategory)) subcategory = subcategory.map(el => el.trim()).filter(el => el)
            if (Object.prototype.toString.call(subcategory) === "[object String]") subcategory = subcategory.trim()
        }

        if (title != undefined) {
            title = title.trim()
            if (isValidData(title)) return res.status(400).send({ status: false, Message: "title should be valid" })
        }
        if (body != undefined) {
            body = body.trim()
            if (isValidData(body)) return res.status(400).send({ status: false, Message: "body should be valid" })
        }

        if (category != undefined) {
            category = category.trim()
            if (isValidData(category)) return res.status(400).send({ status: false, Message: "category should be valid" })
        }

        let updatedBlog = await blogModel.findByIdAndUpdate({ _id: blogId }, { $set: { title: title, body: body, category: category }, $addToSet: { subcategory: subcategory, tags: tags } }, { new: true })

        isPublished ? updatedBlog.publishedAt = new Date() : updatedBlog.publishedAt = null
        updatedBlog.save()
        res.status(200).send({ status: true, message: "Blog update is successful", data: updatedBlog })
    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

//#################################################################################################################################################

const deleteBlog = async (req, res) => {
    try {
        const params = req.params
        const blogId = params.blogId

        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, Message: `${blogId} is not a valid Blog Id` })

        const blog = await blogModel.findOne({ _id: blogId, isDeleted: false });
        if (!blog) return res.status(404).send({ status: false, Message: "Blog not found" });

        await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, Message: "Blog deleted successfully" })
    }
    catch (error) {
        res.status(500).send({ status: false, Message: "Error", error: error.message })
    }
}
//#################################################################################################################################################

const deleteBlogs = async function (req, res) {
    try {
        const filterQuery = { isDeleted: true }
        const queryParams = req.query
        const authorIdFromToken = req.decodedAuthorId

        if (!isValidRequestBody(queryParams)) return res.status(400).send({ status: false, Message: 'No query param received,aborting delete operation' })

        let { authorId, category, tags, subcategory, isPublished } = queryParams

        if (authorId)
            if (isValidData(authorId) && isValidObjectId(authorId)) filterQuery['authorId'] = authorId

        if (category)
            if (isValidData(category)) filterQuery['category'] = category

        if (isPublished)
            if (isValidData(isPublished)) filterQuery['isPublished'] = isPublished

        if (tags)
            if (isValidData(tags)) {
                const tagsArr = tags.trim().split('.').map(tag => tag.trim())
                filterQuery['tags'] = { $all: tagsArr }
            }
        if (subcategory)
            if (isValidData(subcategory)) {
                const subcategoryArray = subcategory.trim().split('.').map(subcat => subcat.trim())
                filterQuery['subcategory'] = { $all: subcategoryArray }
            }

        console.log(filterQuery)

        const blogs = await blogModel.find(filterQuery)

        console.log(blogs)

        if (blogs.length === 0) return res.status(404).send({ staus: false, Message: "No matching blogs found" })

        const idOfBlogsToDelete = blogs.map(blogs => { if (blogs.authorId.toString() === authorIdFromToken) return blogs._id })
        if (idOfBlogsToDelete.length === 0) return res.status(404).send({ status: false, Message: "No blogs found" })


        await blogModel.updateMany({ _id: { $in: idOfBlogsToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, Message: "Blog(s) deleted successfully" })
    }
    catch (err) {
        res.status(500).send({ status: false, Message: "Error", error: err.message })
    }
}
//#################################################################################################################################################

module.exports = { createBlog, getblog, deleteBlogs, updateBlog, deleteBlog }

