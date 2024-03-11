const {connectDB, collections} = require("../src/config/dbConnection")
const {Task} = require("../src/entities/task")
const path = require("path")
const fs = require("fs")
const {createTask} = require("../src/repositories/taskRepository");

describe('taskRepository testing', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = "test"
        await connectDB(process.env.DB_NAME_TEST);
    });

    beforeEach(async() => {
        await collections.tasks.deleteMany()
        const jsonFilePath = path.resolve(__dirname, './Resources/MongoDB/WMS.Task.json');
        const taskData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        await collections.tasks.insertOne(taskData)
    })

    it("should create a new task",async () =>{
        let productList = [
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
        const result=await createTask(new Task("000006","14/03/2024","Unloading","pending",productList,"000867"))
        expect(result).toBeDefined()
    })




});