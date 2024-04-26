
const asyncHandler = require("express-async-handler");
const {createTaskFromData} = require("../factories/taskFactory");
const {createTask, findTasksByCodeOperator, getAllTasks, findTaskByCode, updateTaskData, generateUniqueTaskCode} = require("../repositories/taskRepository");

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
    let task
    if(verifyBodyFields(req.body, "Create")){
        task = createTaskFromData(req.body)
    } else {
        return res.status(401).json({ message: 'Invalid request body. Please ensure all required fields are included and in the correct format.' })
    }

    if(!task.type || !task.date || !task.status || !task.codOperator || !task.productList){
        return res.status(401).json({ message: 'Invalid task data' })
    }

    for(let product of task.productList){
        if(!product._codProduct || (!product._from && !product._to) || !product._quantity){
            return res.status(401).json({ message: 'Invalid product data' })
        }
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
 * Retrieves tasks based on user type.
 *
 * This function retrieves tasks either assigned to a specific operational user or all tasks available if the call is made by an Admin.
 * If the user is of type "Operational", it fetches tasks assigned
 * to that specific operator using their code. If no tasks are found, it returns an error message.
 * If the user is an "Admin", it fetches all tasks. If the retrieval is successful,
 * it returns the task data with HTTP status code 200 (OK). If the retrieval fails (e.g., invalid task data),
 * it returns an error message with HTTP status code 401 (Unauthorized).
 *
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object.
 * @returns {Object} The HTTP response containing either the task data or an error message in JSON format.
 */
const getAll = asyncHandler(async(req, res) => {
    if (req.user._type === "Operational"){
        const result = await findTasksByCodeOperator(req.user._codUser)
        res.status(200).json(result)
    }else{
        const result = await getAllTasks()
        if(result){
            res.status(200).json(result)
        } else {
            res.status(401).json({message: 'Invalid task data'})
        }
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

    if(!verifyBodyFields(req.body, "Update")){
        res.status(401).json({message: 'Invalid request body. Please ensure all required fields are included and in the correct format.'})
    } else{
        for (const task of tasksOfOperator) {
            if (task._codTask === codTask) {
                const updateData = handleUpdateData(req.body, task)
                if(!updateData){
                    res.status(401).json({message: 'The products specified in the request body does not exist in the task\'s product list.'})
                    return
                }
                taskFound = true;
                const filter = { _codTask: codTask }
                const updatedTask = await updateTaskData(filter, updateData)
                res.status(200).json(updatedTask)
                if(updatedTask._status === "Completed"){
                    sendDataToLogistic(updatedTask._productList, req)
                }
                break;
            }
        }
        if(!taskFound && req.user._type === "Admin"){
            const task = await findTaskByCode(codTask)
            if(task){
                const updateData = handleUpdateData(req.body, task)
                if(!updateData){
                    res.status(401).json({message: 'The products specified in the request body does not exist in the task\'s product list.'})
                    return
                }
                const filter = { _codTask: codTask }
                const updatedTask = await updateTaskData(filter, updateData)
                res.status(200).json(updatedTask)
            } else {
                res.status(401).json({message: 'Task not found'})
            }

        }
        if(!taskFound && req.user._type !== "Admin"){
            res.status(401).json({message: 'This operator do not have this specific task assigned'})
        }
    }

})

/**
 * Function to handle updating task data based on the provided body and existing task.
 *
 * @param {Object} body - The body containing the update data.
 * @param {Object} task - The existing task data.
 * @return {Object|null} - The update object or null if any product to be updated does not exist.
**/
const handleUpdateData = (body, task) => {
    if (body._productList) {
        const taskProductList = task._productList
        const productListToUpdate  = body._productList

        const allProductsExist   = productListToUpdate.every(productToUpdate =>
            taskProductList.some(taskProduct => taskProduct._codProduct === productToUpdate._codProduct)
        );

        if (allProductsExist) {
            const update = { $set: {} };
            Object.keys(body).forEach(key => {
                if (key !== '_productList') {
                    update.$set[key] = body[key];
                }

            });

            productListToUpdate.forEach(productToUpdate => {
                taskProductList.forEach(product => {
                    if(product._codProduct === productToUpdate._codProduct){
                        Object.keys(productToUpdate).forEach(field => {
                            product[field] = productToUpdate[field]
                        });
                    }
                })
            })

            update.$set["_productList"] = taskProductList;
            return update;
        } else {
            return null;
        }
    } else {
        const update = { $set: body };
        return update;
    }
}

/**
 * Function to verify the fields in the request body based on the operation type.
 *
 * @param {Object} body - The request body to be verified.
 * @param {string} operation - The type of operation (e.g., "Create" or "Update").
 * @return {boolean} - Indicates whether the fields in the body are valid for the specified operation.
**/
const verifyBodyFields = (body, operation) => {
    const taskValidFields = [
        "_codOperator",
        "_date",
        "_type",
        "_status",
        "_productList",
    ];

    const productValidFields = [
        "_codProduct",
        "_from",
        "_to",
        "_quantity"
    ];

    const validateFields = (fields, body, requireAll) => {
        const presentFields = Object.keys(body);
        const missingFields = fields.filter(field => !presentFields.includes(field));

        if (requireAll) {
            return missingFields.length === 0 && presentFields.length === fields.length;
        } else {
            return presentFields.every(field => fields.includes(field));
        }
    };

    if (operation === "Create") {
        return validateFields(taskValidFields, body, true) &&
            body._productList.every(product => validateFields(productValidFields,  product, true ));
    } else {
        return validateFields(taskValidFields, body) &&
            (!body._productList || body._productList.every(product => (validateFields(productValidFields, product)) && product._codProduct));
    }
}

const sendDataToLogistic = (data, req) => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        //body: {'_productList': data},
        user: req.user
    };

    const url = 'http://localhost:4005/shelf/000017';

    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error during the request: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Risposta dal server:', data);
        })
        .catch(error => {
            console.error('Errore durante la richiesta:', error);
        });
}

module.exports = {
    assignTask,
    getAll,
    getTaskByCode,
    updateTaskByCode
}