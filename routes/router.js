const express = require('express');
const router = express.Router();
const userControl = require('../controller/user')
const { checkAuth, restrictToPost } = require('../middleware/auth');
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
  }
})



const upload = multer({
  storage: storage,
}).single("image");


router.get('/', checkAuth, userControl.homepage)
router.get('/signup', userControl.signup)
router.get('/login', userControl.login)
router.get('/logout', userControl.logout)
router.get('/addblog', checkAuth, userControl.addBlog)
router.get('/blog/:id', checkAuth, userControl.readBlog)
router.get('/dashboard', checkAuth, userControl.dashboard)
router.get('/dashboard/myblogs', checkAuth, userControl.myBlogs)
router.get('/dashboard/updateBlog/:id', checkAuth, userControl.updateBlog)
router.get('/dashboard/updateProfile', checkAuth, userControl.updateProfile)


// Post Routes

router.post('/user', upload , userControl.handleSignup)
router.post('/login', userControl.handleLogin)
router.post('/addblog', upload, checkAuth, restrictToPost, userControl.handleAddBlog)
router.post('/comment/:blogId', restrictToPost, userControl.handleComment)
router.post('/updateBlog/:id', upload,checkAuth, userControl.HandleUpdateBlog)
router.post('/deleteBlog/:id',checkAuth, userControl.HandleDeleteBlog)
router.post('/updateUser', upload , checkAuth, userControl.HandleUpdateUser)

module.exports = router;