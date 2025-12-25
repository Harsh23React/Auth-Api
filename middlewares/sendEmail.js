const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.NODE_CODE_SENDING_EMAIL,
        pass:process.env.NODE_CODE_SENDING_EMAIL_PASSWORD
    }
})
module.exports=transporter