const User = require("../models/userModel");
const e = require("express");
const express = require("express");
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");
const { doHashValidation, HmacProcess } = require("../utils/hashing");
const  transporter  = require("../middlewares/sendEmail");
const { acceptCodeSchema, changePasswordSchema, acceptForgotPasswordSchema } = require("../middlewares/validator");

const signUpSchema = require("../middlewares/validator").signUpSchema;
const signInSchema = require("../middlewares/validator").signInSchema;
const doHash = require("../utils/hashing").doHash;
app.use(express.urlencoded({ extended: true }));
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body || {};
  // if(!name || !email || !password){
  //     return  res.status(400).json({error:'All fields (name,email,password) are required'})
  console.log(name, email, password);
  // }
  try {
    const { error, value } = signUpSchema.validate({ name, email, password });
    if (error) {
      return res
        .status(400)
        .json({ success: "false", error: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    const hashedPassword = await doHash(password, 12);
    const UserCreation = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const result = await UserCreation.save();
    result.password = undefined;
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Both email and password are required" });
  }
  try {
    const { error, value } = signInSchema.validate({ email, password });
    if (error) {
      return res
        .status(400)
        .json({ success: "false", error: error.details[0].message });
    }
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        message: "User signed in successfully",
        token: token,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "User signed out successfully" });
};
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body || {};
  try {
    const existingUser =await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }
    if (existingUser.verified) {
      return res.status(400).json({ error: "User is already verified" });
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    let info = await transporter.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL,
      to: existingUser.email,
      subject: "Verification Code",
      html: "<h1>" + verificationCode + "</h1>",
    });
    if (info.accepted[0] === existingUser.email) {
      const hashCookedvalue = HmacProcess(
        verificationCode,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashCookedvalue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({
        success:true,
        message:'Code Sent'
      })
    }
    res.status(400).json({
        success:false,
        message:'Code Sent Failed'
      })
  } catch (err) {
  console.error("Send verification error:", err);

  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}
};
exports.verifyVerifcationCode=async(req,res)=>{
    const {email,providedCode}=req.body
    console.log(providedCode)
    try{
  const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res
        .status(400)
        .json({ success: "false", error: error.details[0].message });
    }
    const codeValue=providedCode.toString()
    const existingUser=await User.findOne({email}).select("+verificationCode +verificationCodeValidation")
      if (!existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }
    if(existingUser.verified){
        return res.status(400).json({
            success:'false',
            message:"User already verified"
        })
    }
   if (
  !existingUser.verificationCode ||
  !existingUser.verificationCodeValidation
){
         return res.status(400).json({
            success:'false',
            message:"Something is Wrong with the code"
        })
    }
    if(Date.now()-existingUser.verificationCodeValidation>5*60*1000){
        return res
        .status(400)
        .json({
            success:'false',
            message:"Code has been expired"
        })
    }
    const hashCodeValue=HmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
 if (hashCodeValue === existingUser.verificationCode){
        existingUser.verified=true
        existingUser.verificationCode=undefined
        existingUser.verificationCodeValidation=undefined
        await existingUser.save()
            return res
        .status(200)
        .json({
            success:'true',
            message:"You are verified Enjoy the app"
        })
    }
        return res
        .status(400)
        .json({
            success:'false',
            message:"Unexpected Error"
        })
    }
    catch(err){
            console.log(providedCode)
  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    
  });
    }
}

exports.changePassword=async(req,res)=>{
  const {userId,verified}=req.user
  const {oldPassword,newPassword}=req.body

  try{
    const { error, value } = changePasswordSchema.validate({ oldPassword,newPassword });
    if (error) {
      return res
        .status(400)
        .json({ success: "false", error: error.details[0].message });
    }
  
  if(!verified){
    res.status(403)
    .json({
      success:'false',message:"You are not verified"
    })
  }
  const existinguser=await User.findOne({_id:userId}).select('+password');
   if(!existinguser){
        return res.status(400).json({
            success:'false',
            message:"User already verified"
        })
    }
    const result=await doHashValidation(oldPassword,existinguser.password)
    if(!result){
      res.status(401)
      .json({
        success:'false',
        message:"Invalid Credentials"
      })
    }
    const hashPassowrd=await doHash(newPassword,12);
    existinguser.password=hashPassowrd
    await existinguser.save()
       return res.status(200).json({
            success:'true',
            message:"Password Updated"
        })
    
  }
  catch(err){
    // console.log(providedCode)
  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    
  });
  }
}
exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body || {};
  try {
    const existingUser =await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }
    // if (existingUser.verified) {
    //   return res.status(400).json({ error: "User is already verified" });
    // }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    let info = await transporter.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL,
      to: existingUser.email,
      subject: "Forgot Password Code",
      html: "<h1>" + verificationCode + "</h1>",
    });
    if (info.accepted[0] === existingUser.email) {
      const hashCookedvalue = HmacProcess(
        verificationCode,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashCookedvalue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({
        success:true,
        message:'Code Sent'
      })
    }
    res.status(400).json({
        success:false,
        message:'Code Sent Failed'
      })
  } catch (err) {
  console.error("Send verification error:", err);

  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}
};
exports.verifyPasswordCode=async(req,res)=>{
    const {email,providedCode,newPassword}=req.body
    console.log(providedCode)
    try{
  const { error, value } = acceptForgotPasswordSchema.validate({ email, providedCode,newPassword });
    if (error) {
      return res
        .status(400)
        .json({ success: "false", error: error.details[0].message });
    }
    const codeValue=providedCode.toString()
    const existingUser=await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation")
      if (!existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }
    // if(existingUser.verified){
    //     return res.status(400).json({
    //         success:'false',
    //         message:"User already verified"
    //     })
    // }
   if (
  !existingUser.forgotPasswordCode ||
  !existingUser.forgotPasswordCodeValidation
){
         return res.status(400).json({
            success:'false',
            message:"Something is Wrong with the code"
        })
    }
    if(Date.now()-existingUser.forgotPasswordCodeValidation>5*60*1000){
        return res
        .status(400)
        .json({
            success:'false',
            message:"Code has been expired"
        })
    }
    const hashCodeValue=HmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
 if (hashCodeValue === existingUser.forgotPasswordCode){
        // existingUser.verified=true
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password=hashedPassword
        existingUser.forgotPasswordCode=undefined
        existingUser.forgotPasswordCodeValidation=undefined
        await existingUser.save()
            return res
        .status(200)
        .json({
            success:'true',
            message:"You are verified Enjoy the app"
        })
    }
        return res
        .status(400)
        .json({
            success:'false',
            message:"Unexpected Error"
        })
    }
    catch(err){
            console.log(providedCode)
  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    
  });
    }
}