const { MongoClient } = require('mongodb');
const { connectDB, collections, closeDB} = require('../src/config/dbConnection');
const dotenv = require('dotenv');

dotenv.config();
describe('Database Connection', () => {
    let connection;
    let db;
    let tasksCollection;


    beforeAll(async () => {
        connection = await MongoClient.connect(process.env.DB_CONN_STRING);
        db = connection.db(process.env.DB_NAME_TEST);
        tasksCollection = db.collection(process.env.TASK_COLLECTION);
    });

    afterAll(async () => {
        await connection.close();
        await closeDB()
    });

    it('should connect to the database and collection', async () => {
        await connectDB(process.env.DB_NAME_TEST);
        expect(db.databaseName).toBe("WMS_TEST");
        expect(collections.tasks).toBeDefined();
        expect(collections.tasks.collectionName).toBe(tasksCollection.collectionName);

    });

});