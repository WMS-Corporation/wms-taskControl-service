const {collections} = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");

/**
 * Creates a new task.
 *
 * This function inserts a new task into the database.
 *
 * @param {Object} task - The task object to create.
 * @returns {Object} The result of the task creation operation.
 * @throws {Error} If failed to create task.
 */
const createTask = asyncHandler(async (task) => {
    return await collections?.tasks?.insertOne(task)
});

/**
 * Retrieves all tasks.
 *
 * This function handles the retrieval of all tasks from the database.
 *
 * @returns {Array|null} An array containing task data if retrieval is successful, otherwise null.
 */
const getAllTasks = asyncHandler(async () => {
    return await collections?.tasks?.find().toArray()
})

/**
 * Finds a task by code.
 *
 * This function queries the database to find a task based on the provided code.
 *
 * @param {string} codTask - The code of the task to find.
 * @returns {Object|null} The task object if found, or null if not found.
 */
const findTaskByCode = asyncHandler(async (codTask) => {
    return await collections?.tasks?.findOne({ _codTask: codTask })
});

/**
 * Finds a task by code of operator.
 *
 * This function queries the database to find a task based on the provided code of operator.
 *
 * @param {string} codOperator - The code of the operator who has been assigned the task to find.
 * @returns {Object|null} The task object if found, or null if not found.
 */
const findTasksByCodeOperator = asyncHandler(async (codOperator) => {
    return await collections?.tasks?.find({ _codOperator: codOperator }).toArray()
});

/**
 * Updates task data based on a filter.
 *
 * This function updates task data based on the provided filter criteria and the update object.
 *
 * @param {Object} filter - The filter criteria to find the task(s) to update.
 * @param {Object} update - The update object containing the fields to update and their new values.
 * @returns {Object|null} The updated task data if the user is found, otherwise null.
 */
const updateTaskData = asyncHandler(async(filter, update) => {
    const options = { returnOriginal: false}
    await collections?.tasks?.findOneAndUpdate(filter, update, options)
    return await collections?.tasks?.findOne(filter)
})

/**
 * Generates a unique task code.
 *
 * This function generates a unique task code by retrieving the next available code from the counter collection,
 * incrementing the count, and returning the next code as a string padded with zeros to ensure a fixed length of 6 characters.
 *
 * @returns {string} The next unique task code.
 */
const generateUniqueTaskCode = asyncHandler (async () => {
    const nextCode = await collections?.counter?.findOne()
    await collections.counter.updateOne({}, { $inc: {count: 1}})
    return nextCode.count.toString().padStart(6, '0')
})

module.exports = {
    createTask,
    getAllTasks,
    findTaskByCode,
    findTasksByCodeOperator,
    updateTaskData,
    generateUniqueTaskCode
}