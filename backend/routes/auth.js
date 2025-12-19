const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

// 1. Configure AWS 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const lambda = new AWS.Lambda();

// --- ROUTES ---

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const newUser = new User({ email, password });
        await newUser.save();

        // Trigger Provisioning Lambda
        const lambdaParams = {
            FunctionName: process.env.PROVISION_LAMBDA_ARN, 
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({
                body: JSON.stringify({
                    user_id: newUser._id.toString(), 
                    email: newUser.email
                })
            })
        };

        // 2. CREATE THE MISSING TOKEN HERE 🚀
        const token = jwt.sign(
            { user_id: newUser._id.toString(), email: newUser.email }, 
            process.env.JWT_SECRET, 
            { algorithm: 'HS256', expiresIn: '8h' }
        );

        await lambda.invoke(lambdaParams).promise();
        res.status(201).json({ message: "User registered and provisioned", token, email: newUser.email });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Registration failed" });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user_id: user._id.toString(), email: user.email }, 
            process.env.JWT_SECRET, 
            { algorithm: 'HS256', expiresIn: '8h' }
        );
        console.log("User ID from login:",user._id);

        res.status(200).json({ token, email: user.email });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;