const {connectDB} = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const {createTaskFromData} = require("../factories/taskFactory");
const {createTask} = require("../repositories/taskRepository");

const assignTask = asyncHandler(async(req, res) => {
    const task = createTaskFromData(req.body)
    if(!task.type || !task.date || !task.status || !task.codOperator || !task.productList){
        return res.status(401).json({ message: 'Invalid task data' })
    }

    task.codTask = await generateUniqueTaskCode()
    const resultInsert = await createTask(task)
    if(resultInsert){
        res.status(200).json({ message: 'Assignment task successful', task})
    }else{
        return res.status(401).json({ message: 'Invalid task data' })
    }
})

/**
 * Generates a unique task code.
 *
 * This function generates a unique task code by counting the total number of documents across all collections in the database.
 * It connects to the appropriate database based on the environment (either test or production).
 * It then counts the total number of documents in each collection and calculates the next available task code.
 * The generated user code is padded with leading zeros to ensure it has a fixed length of 6 characters.
 *
 * @returns {string} The generated unique task code.
 */
const generateUniqueTaskCode = asyncHandler (async () => {
    let dbName = null;
    if(process.env.NODE_ENV === 'test'){
        dbName = process.env.DB_NAME_TEST
    } else {
        dbName = process.env.DB_NAME;
    }

    const myDB = await connectDB(dbName)
    const collections = await myDB.listCollections().toArray()
    let totalDocuments = 0
    for (const collectionInfo of collections){
        const collectionData = myDB.collection(collectionInfo.name)
        const count = await collectionData.countDocuments()
        totalDocuments += count
    }
    const nextCode = totalDocuments + 1
    return nextCode.toString().padStart(6, '0')
})

module.exports = {
    assignTask
}