const dotenv = require('dotenv')
const {MongoClient} = require("mongodb")
const path = require("path")
const fs = require("fs")
const {connectDB, collections} = require("../src/config/dbConnection");
const {createTask} = require("../src/repositories/taskRepository");
const {Task} = require("../src/entities/task");
const {assignTask} = require("../src/services/taskServices");

dotenv.config()
const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
};
const req = {
    body : ""
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



});