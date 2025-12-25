const jwt=require('jsonwebtoken')

exports.identifier=async(req,res,next)=>{    
let token
if(req.headers.client==='not-browser'){
token=req.headers.authorization
}else{
    token=req.cookies['Authorization']
}
if(!token){
    return res.status(403).json({success:'false',message:'Unauthorized'})
}
try{
       if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
    const jwtVerified=jwt.verify(token,process.env.JWT_SECRET)
    if(jwtVerified){
        req.user=jwtVerified
        next()
    }else{
        throw new Error('error verifying')
    }
}catch(err){
   console.error("JWT Error:", err.message);

    return res.status(401).json({
      success: false,
      message: err.message,
    });
}
}