// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance
    };

    const client = new MongoClient(url)

    // Task 1: Connect to MongoDB
    try {

        //Connect to database
        await client.connect()

        //get instance of db
        dbInstance = client.db(dbName)

        //return instance which allows you to interact with db
        return dbInstance


    } catch (error) {
        console.log("Error: ", error)
    }
}

module.exports = connectToDatabase;
