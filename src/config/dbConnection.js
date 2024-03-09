const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

dotenv.config();

const collections = {};
let client = null;
let db = null;

/**
 * Connects to the database.
 *
 * This function establishes a connection to the MongoDB database using the connection string
 * specified in the environment variables. It initializes the MongoDB client, connects to the
 * database, and sets up the users collection for further database operations.
 */
async function connectDB(dbName) {
    try {
        client = new MongoClient(process.env.DB_CONN_STRING);
        await client.connect();
        db = client.db(dbName);
        const tasksCollection = db.collection(process.env.TASK_COLLECTION);
        collections.tasks = tasksCollection;
        if(process.env.NODE_ENV === "test"){
            console.log("test")
            collections.users = db.collection(process.env.USER_COLLECTION);
        }
        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${tasksCollection.collectionName}`);
        return db;
    } catch (error) {
        console.error('Error during the connection to db: ', error);
    }
}

module.exports = {
    connectDB,
    collections,
    db
};