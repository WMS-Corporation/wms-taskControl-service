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
const getTasks = asyncHandler(async () => {
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

module.exports = {
    createTask,
    getTasks,
    findTaskByCode,
    findTasksByCodeOperator
}