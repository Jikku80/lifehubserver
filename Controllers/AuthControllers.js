const User = require('../Model/UserModel');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SendMail = require('../util/mail');

exports.signUp = async(req, res) => {
    if (!req.body.email) return res.status(400).json({message: 'Please provide your email address'});
    let random = (Math.random() + 1).toString(36).substring(2);
    let lowerrandom = random.substring(5);
    let firsthalf = random.slice(0, 5);
    let upperrandom = firsthalf.toUpperCase();
    let randomnum = Date.now();
    randomnum = randomnum.toString();
    let shortnum = randomnum.slice(9)
    let password = upperrandom + "@" + shortnum + lowerrandom
    let emailAd = req.body.email;
    console.log(password);
    let index = emailAd.indexOf("@");
    let userName = emailAd.slice(0, index); 
    const title = "Lifehub Greeting"
    const messageBody = `We’re thrilled to have you join our community. LifeHub is your gateway to a more connected and fulfilling lifestyle, where every tool and feature is designed to empower you. Here is your secure password to get started: ${password}  
    We  recommend changing your password upon logging in to ensure the highest level of security. If you have any questions or need assistance, our support team is here to help. Welcome aboard, and let’s make life extraordinary together!`
    try{
        const preDefinedUser =  await User.findOne({email: emailAd});
        if (preDefinedUser) return res.status(400).json({message: 'Email address already in use, Did you forgot your password?'});
        const user = await User.create({
            email: emailAd,
            password: password,
            name: userName,
            createdAt: Date.now()
        });
        if (user){
            const expiry = new Date(Date.now() + config.get('COOKIE_EXPIRES') * 24 * 60 * 60 * 1000)
            const token = jwt.sign({
                name: user.name, id: user._id
            }, config.get('JWT_SECRET'),{expiresIn: config.get('JWT_EXPIRE')});
            SendMail(emailAd, messageBody, title)
            res.status(201).json({user, token, expiry})
        }

    }catch(Err){
        console.log('Error in the server!!!!',Err)
    }
}

exports.login = async(req, res) => {
    if (!req.body.email) return res.status(400).json({message: "Please provide your email address!"});
    if (!req.body.password) return res.status(400).json({message: "Please provide your password!"});
    try{
        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(400).json({message: "Email address doesnot match, Signup and create a new account!"})
        const matched = await bcrypt.compare(req.body.password, user.password);
        if (!matched) return res.status(400).json({message: 'Password doesnot match, Incorrect Password!'});
        const expiry = new Date(Date.now() + config.get('COOKIE_EXPIRES') * 24 * 60 * 60 * 1000)
        const token = jwt.sign({name: user.name, id: user._id}, config.get('JWT_SECRET'), {expiresIn: config.get('JWT_EXPIRE')});
        res.status(200).json({user, token, expiry});
    }catch (Err){
        console.log('Error in the server', Err);
    }
}

exports.logout = (req, res) => {
    const expiry = new Date(Date.now() + 10 * 1000);
    res.cookie('jwt', 'loggedout', {
        expires:expiry,
        httpOnly: true
    });
    res.status(200).json({status: 'success', message: 'You just logged out!', expiry});
}

exports.forgotPassword = async(req, res) => {
    try{
        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(400).json({message: "Email doesnot exist!, create new account!"});
        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave: false});
        try{
            if (process.env.NODE_ENV == "development") resetURL =  `http:/127.0.0.1:3000/api/user/reset-password/${resetToken}`
            else resetURL = `${req.protocol}://${req.get('host')}/api/user/reset-password/${resetToken}`;
            const messageBody = `We received a request to reset the password for your account associated with this email. If you made this request copy and paste the following link into your browser: ${resetURL}
            This link will expire soon for security reasons. If you didn’t request a password reset, you can ignore this email. Rest assured, your account is safe. If you have any questions, feel free to contact our support team.`
            const title = "Reset Password! Lifehub"
            SendMail(req.body.email, messageBody, title)
            res.status(200).json({
                status:'success',
                message: 'Token sent to email',
                resetToken: resetToken
            });
        }catch(Err){
            user.createPasswordResetToken = undefined;
            user.createPasswordResetExpires = undefined;
            await user.save({validateBeforeSave: false});
            return res.status(500).json({message:  "There was an error sending the email, try again later"})
        }
    }catch(Err){
        console.log("Error in the server!", Err)
    }
}

exports.resetPassword = async(req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.tokenId).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({message: "Token has expired! click on forgot password again for new token!"})
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({user});
}

exports.updatePassword = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select('+password');
        if (!(await user.correctPassword(req.body.currentPassword, user.password))){
            return res.status(401).json({message: "Please enter your current password! password doesnot match!"});
        }
        user.password = req.body.password;
        await user.save();
        res.status(200).json({user});
    }catch(Err){
        console.log('Error in the server!', Err);
    }
}