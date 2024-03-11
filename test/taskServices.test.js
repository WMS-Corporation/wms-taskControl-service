const dotenv = require('dotenv')
const {MongoClient} = require("mongodb")
const path = require("path")
const fs = require("fs")
const {connectDB, collections} = require("../src/config/dbConnection");
const {createTask} = require("../src/repositories/taskRepository");
const {Task} = require("../src/entities/task");
const {assignTask, getMyTasks, getAll, getTaskByCode} = require("../src/services/taskServices");

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
        process.env.NODE_ENV = "test"
        await connectDB(process.env.DB_NAME_TEST);
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

    it('it should return 401 if the data are invalid', async () => {
        const res=mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "",
            _status: "",
            _productList: ""
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid task data'})
    });

    it('it should return 200 if registration is successful', async () => {
        const res=mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [
                {
                    "_codProduct": "00020",
                    "_name": "Loacker",
                    "_category": "Snack",
                    "_expirationDate": "01-01-2025",
                    "_stock": "40",
                    "_type": "NoRefrigerated"
                },
                {
                    "_codProduct": "00024",
                    "_name": "Caffe Lavazza",
                    "_category": "Caffe",
                    "_expirationDate": "03-04-2024",
                    "_stock": "25",
                    "_type": "NoRefrigerated"
                }
            ]
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    });

    it('it should return 200 and the tasks assigned to this specific operator', async ()=>{
        const res=mockResponse()
        req.user = { _codUser: "000002"}

        await getMyTasks(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if there is not tasks assigned to this operator', async ()=>{
        const res=mockResponse()
        req.user = { _codUser: "000897"}

        await getMyTasks(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "There is not a task assigned to this specific operator"})
    })

    it('it should return 200 and all tasks that are stored', async() =>{
        const res=mockResponse()

        await getAll(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 200 and the task with the taskCode specified', async ()=>{
        const res=mockResponse()
        req.params = { codTask: "000543" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if the taskCode is wrong', async ()=>{
        const res=mockResponse()
        req.params = { codTask: "000877" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task not found"})
    })

    it('it should return 401 if the taskCode is not specified', async ()=>{
        const res=mockResponse()
        req.params = { codTask: "" }

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Invalid task data"})
    })
});