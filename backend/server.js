const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'https://bomboloni-67.github.io', 
        'http://localhost:5173' // Keep this for local testing
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
// MongoDB Connection Logic
const MONGO_URI = process.env.MONGO_URI; 

if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("connected to MongoDB");
        
        // 3. Only start the server once the DB is connected
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`server port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });