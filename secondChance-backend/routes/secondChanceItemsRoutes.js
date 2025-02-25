const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

const app = express()
app.use(express.json())

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here
        const db = await connectToDatabase()
        //Step 2: task 2 - insert code here
        const collection = db.collection("Items");
        //Step 2: task 3 - insert code here
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - insert code here

        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {

        //Step 3: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 3: task 2 - insert code here
        const collection = db.collection("Items");
        //Step 3: task 3 - insert code here
        let secondChanceItem = req.body;
        console.log(secondChanceItem)
        //Step 3: task 4 - insert code here
        const randomId = Math.floor(100 + Math.random() * 900);
        secondChanceItem.id = randomId.toString();

        //Step 3: task 5 - insert code here
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added

        console.log(secondChanceItem)
        secondChanceItem = await collection.insertOne(secondChanceItem)

        res.status(201).json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 4: task 2 - insert code here
        const collection = db.collection("Items")
        //Step 4: task 3 - insert code here
        const itemId = (req.params.id).toString();
        const item = await collection.findOne({ "id": itemId });
        //Step 4: task 4 - insert code here
        if (!item) {
            return res.status(404).send(`Item with ${itemId} not found`);
        }
        res.json(item)
    } catch (e) {
        next(e);
    }
});


// Update and existing item
router.put('/:id', async (req, res, next) => {
    console.log(req.body)
    try {
        //Step 5: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 5: task 2 - insert code here
        const collection = db.collection("Items")
        //Step 5: task 3 - insert code here
        const itemId = (req.params.id).toString();
        const item = await collection.findOne({ "id": itemId });
        if (!item) {
            logger.error('secondChanceItem not found');
            return res.status(404).send(`Item with ${itemId} not found`);
        }

        if (!req.body.category || !req.body.condition || !req.body.age_days || !req.body.description) {
            return res.status(400).json({ error: "Missing required fields in request body" });
        }

        //Step 5: task 4 - insert code here
        const updatedFields = {
            category: req.body.category,
            condition: req.body.condition,
            age_days: req.body.age_days,
            description: req.body.description,
            age_years: Number((req.body.age_days / 365).toFixed(1)),
            updatedAt: new Date()
        };

        const updatepreloveItem = await collection.findOneAndUpdate(
            { "id": itemId },
            { $set: updatedFields },
            { returnDocument: 'after' }
        );
        //Step 5: task 5 - insert code here
        if (updatepreloveItem) {
            res.json({ uploaded: "sucess" })
        } else {
            res.json({ uploaded: "failed" })
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        //Step 6: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 6: task 2 - insert code here
        const collection = db.collection("Items");
        //Step 6: task 3 - insert code here
        const itemId = (req.params.id).toString();
        const item = await collection.findOne({ "id": itemId });
        if (!item) {
            logger.error('secondChanceItem not found');
            return res.status(404).send(`Item with ${itemId} not found`);
        }
        //Step 6: task 4 - insert code here
        await collection.deleteOne({ "id": itemId })
        res.json({ delete: "success" })
    } catch (e) {
        next(e);
    }
});

module.exports = router;
