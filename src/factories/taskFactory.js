const {Task} = require("../entities/task");

/**
 * Creates a task object from task data.
 *
 * This function creates a task object from the provided task data.
 *
 * @param {Object} taskData - The user data to create the task object from.
 * @returns {Task} The created task object.
 */
function createTaskFromData(taskData) {
    return new Task(taskData._codOperator, taskData._date, taskData._type, taskData._status, taskData._productCodeList, taskData._codTask);
}

module.exports = {createTaskFromData}