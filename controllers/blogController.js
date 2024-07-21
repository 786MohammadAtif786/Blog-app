const Blog = require("../models/Blog");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const response = require('../utils/response');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "atif-new",
    acl: "public-read",

    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  }),
}).single("image");

exports.createBlog = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return response(res, false, null, err.message, 400);
    }

    const { title, content } = req.body;

    const imageUrl = req.file.location;
    const author = req.user.userId;

    try {
      const blog = new Blog({ title, content, imageUrl, author });
      await blog.save();
      return response(res, true, blog, "Blog created successfully.", 201);
    } catch (error) {
      console.log(error);
      return response(res, false, null, "Internal server error", 500);
    }
  });
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).populate(
      "author",
      "username"
    );
    return response(res, true, blogs, "Blogs found successfully", 200);
    
  } catch (error) {
    return response(res, false, null, "Internal server error", 500);
  }
};

exports.publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return response(res, false, null, "Blog are not found", 403);
    }
    if (req.user.isAdmin == true) {

      if(blog.published == true) {
        return response(res, false, null, "Blog is already published", 403);
      }

      
    blog.published = true;
    await blog.save();
    return response(res, true, blog, "Blog published successfully", 200);
    } else {
      return response(res, false, null, "Unauthorized", 403);
    }
  

  } catch (err) {
    return response(res, false, null, "Internal server error", 500);
  }

};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!blog) {
      return response(res, false, null, "Blog not found", 404);
    }
    return response(res, true, blog, "Blog found successfully", 200);
    
  } catch (error) {
    return response(res, false, null, "Internal server error", 500);
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return response(res, false, null, "Blog Not found", 404);
    }

    if (req.user.userId !== blog.author.toString() && !req.user.isAdmin) {
      return response(res, false, null, "Unauthorized", 401);
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    
    await blog.save();
    return response(res, false, blog, "Blog updated successfully", 200);
  } catch (error) {
    return response(res, false, null, "Internal server error", 500);
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog){
      return response(res, false, null, "Blog not found", 404);
    }

    if (req.user.userId !== blog.author.toString() && !req.user.isAdmin) {
      return response(res, false, null, "Unauthorized", 401);
    }

    const imageUrl = blog.imageUrl;
    const imageKey = imageUrl.split("/").pop("%20");
    const decodeUri = decodeURIComponent(imageKey);

    const params = {
      Bucket: "atif-new",
      Key: decodeUri,
    };

   // console.log("params", params);

    s3.deleteObject(params, async (err, data) => {
      if (err) {
        console.error("Error deleting image from S3:", err);
        return response(res, false, null, "Error deleting image from S3", 500);
        // return res
        //   .status(500)
        //   .json({ message: "" });
      }
      await blog.deleteOne();
      return response(res, false, null, "Blog deleted successfully", 200);
    });
  } catch (error) {
    return response(res, false, null, "Internal server error", 500);
    
  }
};
