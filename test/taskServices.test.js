const dotenv = require('dotenv')
const path = require("path")
const fs = require("fs")
const {connectDB, collections, closeDB} = require("../src/config/dbConnection");
const {assignTask, getMyTasks, getAll, getTaskByCode, updateTaskByCode} = require("../src/services/taskServices");
const {describe, beforeEach, it, expect, beforeAll, afterAll} = require('@jest/globals')
dotenv.config()
const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
};
const req = {
    body : "",
    user : "",
    params: ""
}

describe('User services testing', () => {

    beforeAll(async () => {
        await connectDB(process.env.DB_NAME_TEST_SERVICES);
        await collections.counter.deleteMany()
        await collections.counter.insertOne({count : 1})
    });

    beforeEach(async() => {
        await collections.tasks.deleteMany()
        const jsonFilePath = path.resolve(__dirname, './Resources/MongoDB/WMS.Task.json');
        const taskData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        await collections.tasks.insertOne(taskData)
        req.body = ""
        req.user = ""
        req.params = ""
    })

    afterAll(async () => {
        await closeDB()
    });

    it('it should return 401 if the data are invalid', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "",
            _status: "",
            _productCodeList: ""
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid task data'})
    });

    it('it should return 200 if registration is successful', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productCodeList: [ "00020", "00024"]
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    });

    it('it should return 200 and the tasks assigned to this specific operator', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}

        await getMyTasks(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if there is not tasks assigned to this operator', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000897"}

        await getMyTasks(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "There is not task assigned to this specific operator"})
    })

    it('it should return 200 and all tasks that are stored', async() => {
        const res = mockResponse()

        await getAll(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 200 and the task with the taskCode specified', async () => {
        const res = mockResponse()
        req.params = { codTask: "000543" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if the taskCode is wrong', async () => {
        const res = mockResponse()
        req.params = { codTask: "000877" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task not found"})
    })

    it('it should return 401 if the taskCode is not specified', async () => {
        const res = mockResponse()
        req.params = { codTask: "" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Invalid task data"})
    })

    it('it should return 200 and the task updated with a new status', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = { codTask: "000543" }
        req.body = { _status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if updating task status with task code that is not assigned to this specific operator', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = { codTask: "000544" }
        req.body = { _status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "This operator do not have this specific task assigned"})
    })

    it('it should return 401 if one tries to updating a task status, but the operator do not have task assigned', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000003"}
        req.params = { codTask: "000543" }
        req.body = { _status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "This operator do not have this specific task assigned"})
    })

    it('it should return 401 if try to updating field that is not specified for the task ', async () => {
        const res = mockResponse()
        const req = {
            user:{
                _codUser:"000002"
            },
            params: {
                codTask: "000543"
            }, body:{
                _name: "Order 1"
            }
        };
        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task does not contain any of the specified fields."})
    })

    it('it should return 200 if the admin try to update task with a new status', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000001", _type: "Admin"}
        req.params = { codTask: "000543" }
        req.body = { _status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 200 if the admin try to update task that not exists', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000001", _type: "Admin"}
        req.params = { codTask: "001543" }
        req.body = { _status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task not found"})
    })
});