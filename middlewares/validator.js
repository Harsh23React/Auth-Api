const JOI=require('joi');
exports.signUpSchema=JOI.object({
    name:JOI.string().min(3).max(30).required(),
    email:JOI.string().min(6).max(60).required().email({
        tlds:{allow:['com','net','org','edu' ]}
    }),  
    password:JOI.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
})

exports.signInSchema=JOI.object({
 email:JOI.string().min(6).max(60).required().email({
        tlds:{allow:['com','net','org','edu' ]}
    }),  
    password:JOI.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
})
exports.acceptCodeSchema=JOI.object({
    email:JOI.string()
    .min(6)
    .max(60)
    .required()
    .email({
        tlds:{
            allow:['com','net']
        }
    }),
    providedCode:JOI.number()
})
exports.changePasswordSchema=JOI.object({
   newPassword:JOI.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
      oldPassword:JOI.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
})
exports.acceptForgotPasswordSchema=JOI.object({
    email:JOI.string().min(6).max(60).required().email({
        tlds:{allow:['com','net','org','edu' ]}
    }),  
     newPassword:JOI.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
       providedCode:JOI.number()
})