const Post = require("../models/postModel")

exports.getPosts=async (req,res)=>{
    const {page}=req.query
    const postsperPage=10
    const {title,description,userId}=req.body
    try{
        let pageNum=0
        if(page<=1){
            pageNum=0
        }else{
            pageNum=page-1
        }
const post=await Post.find({title,description,userId})
res.status(200).json({
    status:'true',
    message:'All Post Fetched Succesffully',
    post
})
    }
    catch(err){

    }
}