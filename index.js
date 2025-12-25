const express=require('express')
const cors=require('cors')
const helmet=require('helmet')
const app=express()
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')
const User=require('./models/userModel')
const authRouter=require('./routers/authRouter')
const postRouter=require('./routers/postRouter')
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/auth',authRouter)
app.use('/api',postRouter)
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('Connected to MongoDB')
}).catch(err=>{
    console.log('Error connecting to MongoDB:',err)
})
app.get('/',(req,res)=>{
    res.send('Auth API is running')
    console.log('Auth API is running')
})
// app.post('/register',async(req,res)=>{
//     const {name,email,password,city}=req.body||{}
//       if (!name || !email || !password || !city) {
//     return res.status(400).json({
//       error: 'All fields (name, email, password,) are required'
//     });
//   }
// try{
//     await User.create({name,email,password,city})
//     res.status(200).json({message:'User registered successfully'})
// }
// catch(err){
//     res.status(500).json({error:err.message})   
// }
// })
app.listen(process.env.PORT)