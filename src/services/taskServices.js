const { db} = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const {createTaskFromData} = require("../factories/taskFactory");
const {createTask, findTasksByCodeOperator, getAllTasks, findTaskByCode, updateTaskData} = require("../repositories/taskRepository");

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
        res.status(401).json({message: 'There is not task assigned to this specific operator'})
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
 * Retrieves task by code.
 *
 * This function handles the retrieval of task based on the provided code.
 * It extracts the task code from the request parameters.
 * If the task code is provided, it calls the findTaskByCode function to search for the task in the database.
 * If the task is found, it returns the task data with HTTP status code 200 (OK).
 * If the task is not found, it returns an error message with HTTP status code 401 (Unauthorized).
 * If the task code is invalid or missing, it returns an error message with HTTP status code 401 (Unauthorized).
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The HTTP response containing either the task data or an error message in JSON format.
 */
const getTaskByCode = asyncHandler(async (req, res) => {
    const taskCode = req.params.codTask
    if(taskCode){
        const task = await findTaskByCode(taskCode)
        if(task){
            res.status(200).json(task)
        } else{
            res.status(401).json({message: 'Task not found'})
        }
    }else{
        res.status(401).json({message:'Invalid task data'})
    }
})

/**
 * Updates the data of a task.
 *
 * This function handles the request to update the data of a task.
 * It first checks if the operator has tasks assigned and then searches for the task with the specified task code.
 * If the task is found, it updates the task data with the provided data in the request body.
 * If the operator does not have any tasks assigned, it returns a 401 status with a corresponding message.
 * If the specified task is not assigned to the operator, it returns a 401 status with a message indicating that.
 *
 * @param {Object} req - The request object containing the task code parameter and the new data in the request body.
 * @param {Object} res - The response object used to send the result of the task update operation.
 */
const updateTaskByCode = asyncHandler(async (req, res) => {
    const codTask = req.params.codTask
    const tasksOfOperator = await findTasksByCodeOperator(req.user._codUser)
    let taskFound = false;

    if(tasksOfOperator.length !== 0){
        for (const task of tasksOfOperator) {
            if (task._codTask === codTask) {
                taskFound = true;
                const filter = { _codTask: codTask }
                const update = { $set: req.body}
                const updatedTask = await updateTaskData(filter, update)
                res.status(200).json(updatedTask)
                break;
            }
        }
    } else{
        res.status(401).json({message: 'This operator do not have tasks assigned'})
    }

    if(!taskFound){
        res.status(401).json({message: 'This operator do not have this specific task assigned'})
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
    const collections = await db.instance.listCollections().toArray()
    let totalDocuments = 0
    for (const collectionInfo of collections){
        const collectionData = db.instance.collection(collectionInfo.name)
        const count = await collectionData.countDocuments()
        totalDocuments += count
    }

    const nextCode = totalDocuments + 1
    return nextCode.toString().padStart(6, '0')
})

module.exports = {
    assignTask,
    getMyTasks,
    getAll,
    getTaskByCode,
    updateTaskByCode
}