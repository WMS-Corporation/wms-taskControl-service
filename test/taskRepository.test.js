const {connectDB, collections, closeDB} = require("../src/config/dbConnection")
const {Task} = require("../src/entities/task")
const path = require("path")
const fs = require("fs")
const {createTask, findTaskByCode, getAllTasks, findTasksByCodeOperator, updateTaskData} = require("../src/repositories/taskRepository");

describe('taskRepository testing', () => {
    beforeAll(async () => {
        await connectDB(process.env.DB_NAME_TEST_REPOSITORY);
    });

    beforeEach(async() => {
        await collections.tasks.deleteMany()
        const jsonFilePath = path.resolve(__dirname, './Resources/MongoDB/WMS.Task.json');
        const taskData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        await collections.tasks.insertOne(taskData)
    })
    afterAll(async () => {
        await closeDB()
    });

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

    it('should find a task by code', async () => {
        const task = await findTaskByCode("000543")
        expect(task._type).toEqual("loading")
        expect(task._date).toEqual("11/03/2023")
    });

    it('should return null if task is not found', async () => {
        const codTask = 'nonexistenttask'
        const task = await findTaskByCode(codTask)

        expect(task).toBeNull()
    });

    it('should return all the tasks', async() => {
        const result= await getAllTasks()
        const numDoc = await collections.tasks.countDocuments()
        expect(result.length).toEqual(numDoc)
    })

    it('should return a tasks by code of operator', async() =>{
        const codOperator = "000002"
        const tasks = await findTasksByCodeOperator(codOperator)
        expect(tasks[0]._type).toEqual("loading")
        expect(tasks[0]._date).toEqual("11/03/2023")
    })

    it('should return null if there is not a task assigned to this specific operator', async () => {
        const codOperator = '000965'
        const tasks = await findTasksByCodeOperator(codOperator)

        expect(tasks.length).toEqual(0)
    });

    it('should return an updated task with new status', async() => {
        const filter = { _codTask: "000543" }
        const update = { $set: { _status: "Completed" } }

        const updatedTask = await updateTaskData(filter, update)
        expect(updatedTask._status).toEqual("Completed")
    })

    it('should return null if the filter is not correct', async() => {
        const filter = { _codTask: "" }
        const update = { $set: { _status: "Completed" } }

        const updatedTask = await updateTaskData(filter, update)
        expect(updatedTask).toBeNull()
    })


});