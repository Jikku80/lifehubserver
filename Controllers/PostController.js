const PostModel = require('../Model/PostModel');

exports.newPost = async(req, res) => {
    try{
        const post = await PostModel.create(req.body);
        res.status(200).json({post});
    }catch(Err){
        console.log("Error in the server!", Err)
    }
}

exports.getOnePost = async(req, res) => {
    try{
        if (!req.params.id) return res.status(400).json({message: "Id wasnot submitted!"})
        const post = await PostModel.findOne({_id: req.params.id});
        if (!post) return res.status(400).json({message: "No post found in the server!"})
        res.status(200).json({post});
    }catch(Err){
        let stringError = Err.toString();
        if (stringError.includes('CastError')){
            return res.status(400).json({message: "Cast Error! No post found in the server!"})
        }
        console.log("Error in the server!", Err)
    }
}

exports.getAllPost = async(req, res) => {
    try{
        const post = await PostModel.find({hubby: req.params.hubby});
        if (!post) return res.status(400).json({message:  "No post found!"});
        res.status(200).json({post});
    }catch(Err){
        console.log("Error in the server!", Err);
    }
}

exports.updatePost = async(req, res) => {
    try{
        if (!req.params.id) return res.status(400).json({message: "Please provide a valid id!"});
        await PostModel.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).json({message: "Post has been succussfully updated!"})
    }catch(Err){
        console.log("Error in the server!", Err);
    }
}

exports.deletePost = async(req, res) =>  {
    try{
        if (!req.params.id) return res.status(400).json({message: "Please provide a valid id!"});
        await PostModel.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post has been deleted successfully!"});
    }catch(Err){
        console.log("Error in the server!", Err)
    }
}