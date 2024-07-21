const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

dotenv.config();

const app = express();
app.use(express.json({limit: '50mb'}));

// Connect to MongoDB
connectDB();


// Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgMagenta);
});
