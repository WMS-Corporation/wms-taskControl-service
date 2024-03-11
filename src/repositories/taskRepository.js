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

module.exports = {
    createTask
}