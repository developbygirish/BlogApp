const Post = require('../model/blog')
const Comment = require('../model/comment')
const User = require('../model/user')
const fs = require('fs')

const auth = require('../service/auth')
exports.homepage = async (req, res) => {
    try {
        const posts = await Post.find({});
        return res.render('index', {
            user: req.user,
            posts
        })
    } catch (error) {
        return res.send("internal server error");
    }


}

exports.addBlog = (req, res) => {


    return res.render("addblog", {
        user: req.user,
    })
}


exports.updateBlog = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id)


        return res.render("updateBlog", {
            user: req.user,
            post
        })
    } catch (error) {
        return res.send("internal server error");
    }


}



exports.signup = (req, res) => {
    return res.render('signup')
}

exports.login = (req, res) => {
    return res.render('login')
}
exports.updateProfile = (req, res) => {
    return res.render('updateProfile', {
        user: req.user,
    })
}


exports.dashboard = async (req, res) => {
    try {

        const blogs = await Post.find({ createdBy: req.user._id })
     


        const totalViews = await Post.aggregate([
            {
              $project: {
                viewsCount: { $size: "$views" } // Count the size of the 'views' array
              }
            },
            {
              $group: {
                _id: null,
                totalViews: { $sum: "$viewsCount" } // Sum up the 'viewsCount' for all posts
              }
            }
          ]);

        const totalViewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0;
     

        const userPostIds = await Post.find({ createdBy: req.user._id }, '_id');
    
        const postIds = userPostIds.map(post => post._id);
        
        const comments = await Comment.find({ blogId: { $in: postIds } }).populate('createdBy');
  

        return res.render('dashboard', {
            user: req.user, blogs, comments, totalViewsCount
        })
    } catch (error) {
        console.log(error)
        return res.status(400).send('Internal Server Error!')
    }

}



exports.readBlog = async (req, res) => {
    try {
        const id = req.params.id
        const blog = await Post.findById(id).populate('createdBy')
        const comment = await Comment.find({ blogId: id }).populate('createdBy')

        await Post.findByIdAndUpdate(
            id,
            {
                $push: {
                    views: { timestamps: Date.now() }
                }
            }
        );

        return res.render('readBlog', { blog, comment, user: req.user, })
    } catch (error) {
        console.log(error)
        return res.status(400).send('Internal Server Error!')
    }
}




exports.logout = (req, res) => {
    return res.clearCookie("token").redirect("/")
}


exports.handleSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profileImage = req.file.filename;
        const users = await User.create({
            name, email, password, profileImage
        })

        return res.redirect('/login')

    } catch (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error");
    }
}


exports.HandleUpdateUser = async (req, res) => {
    try {
        const id = req.user._id
        const { name, email, password } = req.body;
        const profileImage = req.file.filename;
        await User.findByIdAndUpdate(id, {
            name, email, password, profileImage
        })

        const updatedUser = await User.findById(id)
        console.log(updatedUser)
        res.cookie('token', auth.setUser(updatedUser))

        return res.redirect('/dashboard/updateProfile')

    } catch (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error");
    }
}


exports.handleAddBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const image = req.file.filename;

        // Create a new Post with the image filename
        await Post.create({
            title,
            content,
            image,
            createdBy: req.user._id,
            views: [],
        });

        const post = await Post.findOne({ title: title, content: content, image: image });        

        return res.redirect(`/blog/${post._id}`);

    } catch (error) {
        console.log(error);
        return res.status(400).send("Internal Server Error");
    }
};



exports.HandleUpdateBlog = async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = "";
    
        if (req.file) {
            new_image = req.file.filename;
    
            // Delete the previous cover image
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        }
        else {
            new_image = req.body.old_image || ""; // Use an empty string if no new image
        }
    
        const { title, content } = req.body;
        
        // Use new_image directly, no need for separate 'image' variable
        await Post.findByIdAndUpdate(id, {
            title,
            content,
            image: new_image,
            createdBy: req.user._id
        });
    
        const post = await Post.findOne({ _id: id });
    
        return res.redirect(`/blog/${post._id}`);
    
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
    
};






exports.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password)

        return res.cookie("token", token).redirect('/')

    } catch (error) {

        return res.render('login', {
            error: "Invalid Password or Email"
        });
    }
}


exports.handleComment = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const comment = await Comment.create({
            comment: req.body.com,
            blogId: blogId,
            createdBy: req.user._id,
        })



        return res.redirect(`/blog/${blogId}`)

    } catch (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error!")
    }
}


exports.myBlogs = async (req, res) => {
    try {
        const posts = await Post.find({ createdBy: req.user._id });
        return res.render('myBlog', {
            user: req.user,
            posts
        })

    } catch (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error!")
    }
}

exports.HandleDeleteBlog = async (req, res) => {
    try {
        const id = req.params.id;
        const result=await Post.findByIdAndDelete(id);
        await Comment.findOneAndDelete({ blogId: id })

        if (result && result.image !== "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        return res.redirect("/dashboard/myblogs")

    } catch (error) {
        console.log(error)
        return res.status(400).send("Internal Server Error!")
    }
}

