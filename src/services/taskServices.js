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
    if(verifyBodyFields(req.body, "Create", taskValidFields, productValidFields)){
        task = createTaskFromData(req.body)
    } else {
        return res.status(401).json({ message: 'Please ensure all required fields are included and in the correct format.' })
    }

    if(!task.type || !task.date || !task.status || !task.codOperator || !task.productList){
        return res.status(401).json({ message: 'Invalid task data' })
    }

    for(let product of task.productList){
        if(!product._codProduct || (!product._from && !product._to) || !product._quantity){
            return res.status(401).json({ message: 'Invalid product data' })
        }
        let responseProductService = await validateTaskProductConstraints(product, req, 'product')
        let responseLogisticService = await validateTaskProductConstraints(product, req, 'logistic')
        if(responseProductService.status === 401){
            return res.status(401).json({ message: 'Product not defined.' })
        }
        switch (responseLogisticService.status){
            case 401:
                return res.status(401).json({ message: 'Shelf not found.' })
            case 402:
                return res.status(401).json({ message: 'Product not defined in a shelf.' })
            case 403:
                return res.status(401).json({ message: 'The requested quantity exceeds the available stock for the product.' })
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
        res.status(200).json(result)
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

    if(!verifyBodyFields(req.body, "Update", taskValidFields, productValidFields)){
        res.status(401).json({message: 'Please ensure all required fields are included and in the correct format.'})
    } else{
        if(req.body._productList){
            for(let product of req.body._productList){
                let responseProductService = await validateTaskProductConstraints(product, req, 'product')
                let responseLogisticService = await validateTaskProductConstraints(product, req, 'logistic')
                if(responseProductService.status === 401){
                    return res.status(401).json({ message: 'Product not defined.' })
                }
                switch (responseLogisticService.status){
                    case 401:
                        return res.status(401).json({ message: 'Shelf not found.' })
                    case 402:
                        return res.status(401).json({ message: 'Product not defined in a shelf.' })
                    case 403:
                        return res.status(401).json({ message: 'The requested quantity exceeds the available stock for the product.' })
                }
            }
        }
        for (const task of tasksOfOperator) {
            if (task._codTask === codTask) {
                taskFound = true;
                const update = { $set: req.body }
                const filter = { _codTask: codTask }
                const updatedTask = await updateTaskData(filter, update)
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
                const update = { $set: req.body }
                const filter = { _codTask: codTask }
                const updatedTask = await updateTaskData(filter, update)
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
 * Verifies the fields in the request body based on the operation type and the valid fields for the main entity and sub-entities.
 *
 * This function checks whether the fields in the request body are valid for the specified operation type ("Create" or "Update").
 * It validates the presence and correctness of required fields for the main entity and its sub-entities.
 * Returns true if all fields are valid; otherwise, returns false.
 *
 * @param {Object} body - The request body to be verified.
 * @param {string} operation - The type of operation (e.g., "Create" or "Update").
 * @param {Array} validFields - The array of valid fields for the main entity.
 * @param {Array} subEntityValidFields - The array of valid fields for sub-entities.
 * @return {boolean} - Indicates whether the fields in the body are valid for the specified operation.
 */
const verifyBodyFields = (body, operation, validFields, subEntityValidFields) => {

    const validateFields = (fields, body, requireAll) => {
        const presentFields = Object.keys(body);
        const missingFields = fields.filter(field => !presentFields.includes(field));

        if (requireAll) {
            return missingFields.length === 0 && presentFields.length === fields.length;
        } else {
            return presentFields.every(field => fields.includes(field));
        }
    };

    const isArrayOfJSON = Object.values(body).some(value => Array.isArray(value) &&
        value.every(item => typeof item === 'object' && item !== null))

    if (operation === "Create") {
        return validateFields(validFields, body, true) &&
            (!isArrayOfJSON || Object.values(body).some(value => Array.isArray(value) &&
                value.every(item => validateFields(subEntityValidFields, item, true))))
    } else {
        return validateFields(validFields, body) &&
            (!isArrayOfJSON || Object.values(body).some(value => Array.isArray(value) &&
                value.every(item => (validateFields(subEntityValidFields, item, true)))));
    }
}

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

/**
 * Sends data to the logistic service when the task is completed.
 *
 * @param {Array} data - The data to be sent for transfer.
 * @param {Object} req - The request object containing headers and user information.
 */
const sendDataToLogistic = (data, req) => {
    let authorization = req.headers.authorization
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': authorization},
        body: JSON.stringify({ '_productList': data }),
        user: req.user
    };

    const url = 'http://localhost:4005/shelf/transfer';

    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response from server:', data);
        })
        .catch(error => {
            console.error('Error during the request:', error);
        });
}

/**
 * Fetches data from the specified URL using the provided request options.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {Object} req - The request object containing headers and user information.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and data.
 *                           - { status: 200, data } if the request is successful.
 *                           - { status: 401 } if the response is not OK.
 *                           - { status: 500 } if there is an error during the request.
 */
const fetchData = async (url, req) => {
    let authorization = req.headers.authorization
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': authorization},
        user: req.user
    }

    try {
        const response = await fetch(url, requestOptions)
        if (!response.ok) {
            return { status: 401 }
        }
        const data = await response.json()
        return { status: 200, data }
    } catch (error) {
        console.error('Error during the request:', error)
        return { status: 500 }
    }
}

/**
 * Validates the constraints of a task's product based on the specified service type.
 *
 * @param {Object} data - The data object containing product and logistic information.
 * @param {Object} req - The request object containing headers and user information.
 * @param {string} service - The type of service to validate ('product' or 'logistic').
 * @returns {Promise<Object>} A promise that resolves to an object containing the status.
 *                           - { status: 200 } if the validation is successful.
 *                           - { status: 401 } if the shelf or product is not found.
 *                           - { status: 402 } if the product is not defined in a shelf.
 *                           - { status: 403 } if the requested quantity exceeds the available stock.
 */
const validateTaskProductConstraints = asyncHandler (async (data, req, service) => {

    switch(service){
        case 'product':
            var url = 'http://localhost:4002/' + data._codProduct
            return await fetchData(url, req)

        case 'logistic':
            if(data._from && data._from !== "Outside"){
                const fromUrl = 'http://localhost:4005/shelf/' + data._from
                const fromResponse = await fetchData(fromUrl, req)

                if (fromResponse.status !== 200) {
                    return fromResponse
                }

                const productExist = fromResponse.data._productList.find(product => product._codProduct === data._codProduct)

                if (!productExist) {
                    return { status: 402 }
                }

                if ((productExist._stock - data._quantity) < 0) {
                    return { status: 403 }
                }
                return fromResponse
            }

            if(data._to && data._to !== "Outside"){
                const toUrl = 'http://localhost:4005/shelf/' + data._to
                const toResponse = await fetchData(toUrl, req)
                if (toResponse.status !== 200) {
                    return toResponse
                }
                return toResponse
            }

    }

})

module.exports = {
    assignTask,
    getAll,
    getTaskByCode,
    updateTaskByCode,
    sendDataToLogistic,
    fetchData,
    validateTaskProductConstraints
}