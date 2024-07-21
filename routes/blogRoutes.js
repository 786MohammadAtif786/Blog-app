const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, publishBlog } = require('../controllers/blogController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.post('/', authenticate, createBlog);
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.put('/:id', authenticate, updateBlog);
router.delete('/:id', authenticate, isAdmin, deleteBlog);
router.put('/published/:id', authenticate, isAdmin, publishBlog)

module.exports = router;
