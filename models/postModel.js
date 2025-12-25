const { required } = require('joi')
const mongoose=require('mongoose')

const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Title is required'],
        trim:true
    },
    description:{
        type:String,
        required:[true,'Description is required'],
        trim:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:mongoose.model('User'),
        required:[true,'User ID is required']
    }
},
{
    timestamps:true
}
)
const Post=mongoose.model('Post',postSchema)
module.exports=Post