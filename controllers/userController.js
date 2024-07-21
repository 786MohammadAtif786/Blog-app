const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return response(res, false, null, "All Fields are required", 401);
    }
    const user = new User({ name, email, password, isAdmin });
    await user.save();
    return response(res, true, user, "User registered successfully", 201);
  } catch (error) {
    if(error.code === 11000) {
      return response(res, false, null, "Email Already exists.", 401);
    }
    return response(res, false, null, "Internal server error", 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return response(res, false, null, "All Fields are required", 401);
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response(res, false, null, 'Invalid credentials', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response(res, false, null, "Invalid credentials", 400);
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    user.password = undefined;
    const userObj = user.toObject();
    userObj.token = token;
    return response(res, true, userObj, "User login successfully", 200);
  } catch (error) {
    return response(res, false, null, "Internal server error", 500);
  }
};
