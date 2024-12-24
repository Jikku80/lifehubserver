const express = require('express');
const PostController = require('../Controllers/PostController');

const route = express.Router();

route.post('/', PostController.newPost);
route.get('/getOnePost/:id', PostController.getOnePost);
route.get('/getAllPost/:hubby', PostController.getAllPost);
route.patch('/updatePost/:id', PostController.updatePost);
route.delete('/deletePost/:id', PostController.deletePost);

module.exports = route;