
const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required']
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:[true,'Email already exists'],
        lowercase:true,
        minLength:[5,'Email must be at least 5 characters long'],
        trim:true
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        trim:true,
        select:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationCode:{
        type:String,
        select:false
    },
        verificationCodeValidation:{
        type:String,
        select:false
    },
    forgotPasswordCode:{
        type:String,
        select:false
    },
       forgotPasswordCodeValidation:{
        type:String,
        select:false
    },
},
{
    timestamps:true
}
)
const User=mongoose.model('User',userSchema)
module.exports=User
