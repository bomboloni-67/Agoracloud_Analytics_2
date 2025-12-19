const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AWS = require('aws-sdk');
// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const lambda = new AWS.Lambda();

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check if user exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // 2. Save to MongoDB
        const newUser = new User({ email, password });
        await newUser.save();

        // 3. Trigger Provisioning Lambda (Matches Step A3 in your guide)
        const lambdaParams = {
            FunctionName: process.env.PROVISION_LAMBDA_ARN, 
            InvocationType: 'RequestResponse', // Synchronous
            Payload: JSON.stringify({
                body: JSON.stringify({
                    unique_id: newUser._id.toString(), 
                    email: newUser.email
                })
            })
        };

        const lambdaResult = await lambda.invoke(lambdaParams).promise();
        const resultPayload = JSON.parse(lambdaResult.Payload);

        if (resultPayload.statusCode !== 200) {
            console.error("QuickSight Provisioning Error:", resultPayload.body);
        }

        res.status(201).json({ message: "User registered and provisioned successfully" });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Error during registration process" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const token = jwt.sign(
            { user_id: user._id.toString(), email: user.email }, 
            privateKey, 
            { algorithm: 'RS256', expiresIn: '8h' }
        );

        res.status(200).json({ token, email: user.email });
    } catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
});

// GET EMBED URL FOR AUTHENTICATED USER
router.get('/embed-url', async (req, res) => {
    try {
        // 1. Get user info from the JWT (provided by your existing auth middleware)
        // For now, let's assume req.user is populated by your JWT check
        const userArn = `arn:aws:quicksight:us-east-1:${process.env.AWS_ACCOUNT_ID}:user/default/${req.user.user_id}`;

        const params = {
            AwsAccountId: process.env.AWS_ACCOUNT_ID,
            UserArn: userArn,
            SessionLifetimeInMinutes: 600, // Max 10 hours
            ExperienceConfiguration: {
                GenerativeQnA: {
                    InitialTopicId: process.env.QUICKSIGHT_TOPIC_ID // The ID of your Q Topic
                }
            }
        };

        const result = await lambda.generateEmbedUrlForRegisteredUser(params).promise();
        res.json({ embedUrl: result.EmbedUrl });
    } catch (err) {
        console.error("Embedding Error:", err);
        res.status(500).json({ message: "Could not generate embed URL" });
    }
});

module.exports = router;