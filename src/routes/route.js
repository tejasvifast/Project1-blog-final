const express = require('express');
const router = express.Router();

const blogController = require("../controllers/blogController")
const authorController = require("../controllers/authorController")
const middleWare =require("../middleWare/middleWare")

router.post('/Authors',authorController.createAuthor) //done

router.post("/login",authorController.loginAuthor)   //done

router.post("/Blogs" ,middleWare.authenticate,blogController.createBlog)    //done     

router.get("/getBlogs",middleWare.authenticate,blogController.getblog)   //done 

router.put('/blogs/:blogId' ,middleWare.authenticate, middleWare.authorize,blogController.updateBlog)   //done

router.delete('/blogs/:blogId',middleWare.authenticate, middleWare.authorize,blogController.deleteBlog)   //done

router.delete("/blogs",middleWare.authenticate, middleWare.authorizeForDelete,blogController.deleteBlogs)   //done



module.exports = router; 