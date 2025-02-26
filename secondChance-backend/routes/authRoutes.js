const express = require('express');
const connectToDatabase = require('../models/db')
const router = express.Router();
const logger = require('../logger');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {

    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");
        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email already exist' })
        }
        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await brcypt.genSalt(10);
        const hashpsw = await brcypt.hash(req.body.password, salt);

        // Task 5: Insert the user into the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashpsw,
            createdAt: new Date(),
        });

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        // Task 7: Log the successful registration using the logger
        logger.info('User registered successfully');
        // Task 8: Return the user email and the token as a JSON
        return res.status(200).json({ authtoken, email: req.body.email })
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;