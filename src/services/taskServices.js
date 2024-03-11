const {connectDB} = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const {createTaskFromData} = require("../factories/taskFactory");
const {createTask, findTasksByCodeOperator, getAllTasks} = require("../repositories/taskRepository");

/**
 * Assigning a task to a specific operator.
 *
 * This function handles the assignment of a task based on the data provided in the request body.
 * It validates the task data and generates a unique task code before inserting the task into the database.
 * If the task is successfully inserted, it returns a success message along with the assigned task details.
 * If the task data is invalid or insertion fails, it returns an error message.
 *
 * @param {Object} req - The request object containing the task data in the body.
 * @param {Object} res - The response object used to send the result of the assignment process.
 * @returns {Object} The HTTP response with the task created.
 */
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
 * Retrieves the task/tasks information about the specific operator.
 *
 * This function handles the retrieval of tasks information.
 * It returns the tasks data for the specific operator.
 *
 * @param {Object} req - The request object containing the Operator information.
 * @param {Object} res - The response object.
 * @returns {Object} The HTTP response with the task/tasks that has been assigned to the operator in JSON format.
 */
const getMyTasks = asyncHandler(async(req, res) => {
    const result = await findTasksByCodeOperator(req.user._codUser)
    if(result.length !== 0){
        res.status(200).json(result)
    } else {
        res.status(401).json({message: 'There is not a task assigned to this specific operator'})
    }
})

/**
 * Retrieves all tasks.
 *
 * This function handles the retrieval of all tasks from the database.
 * It calls the getTasks function to fetch the task data.
 * If the retrieval is successful, it returns the task data with HTTP status code 200 (OK).
 * If the retrieval fails (e.g., invalid task data), it returns an error message with HTTP status code 401 (Unauthorized).
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The HTTP response containing either the task data or an error message in JSON format.
 */
const getAll = asyncHandler(async(req, res) => {
    const result = await getAllTasks()
    if(result){
        res.status(200).json(result)
    } else {
        res.status(401).json({message: 'Invalid task data'})
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
    assignTask,
    getMyTasks,
    getAll
}