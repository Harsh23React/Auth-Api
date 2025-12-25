const express=require('express')
const postController=require('../controllers/postController')
const router=express.Router()

const { identifier } = require('../middlewares/identification')
router.get('/all-posts',postController.getPosts)
// router.get('/single-post',authController.signin)
// router.post('/create-post',identifier,authController.signout)
// router.put('/update-post',identifier,authController.sendVerificationCode)
// router.delete('/delete-post',identifier,authController.verifyVerifcationCode)

module.exports=router