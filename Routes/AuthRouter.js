const express = require('express');
const AuthController = require('../Controllers/AuthControllers');

route = express.Router();

route.post('/signup', AuthController.signUp);
route.post('/login', AuthController.login);
route.get('/logout', AuthController.logout);
route.post('/forgot-password', AuthController.forgotPassword);
route.post('/reset-password/:tokenId', AuthController.resetPassword);
route.patch('/update-password', AuthController.updatePassword);

module.exports = route;