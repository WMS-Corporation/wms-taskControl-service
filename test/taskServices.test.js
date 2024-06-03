const dotenv = require('dotenv')
const path = require("path")
const fs = require("fs")
const {connectDB, collections, closeDB} = require("../src/config/dbConnection");
let {getAll, getTaskByCode, updateTaskByCode, fetchData, validateTaskProductConstraints, assignTask} = require("../src/services/taskServices");
const {describe, beforeEach, it, expect, beforeAll, afterAll} = require('@jest/globals')
dotenv.config()
const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}
const req = {
    body : "",
    user : "",
    params: "",
    headers: {
        authorization: 'Bearer some-token'
    }
}

const mockFetch = jest.fn().mockImplementation(async (url, requestOptions) => {
    const defaultResponse = {
        ok: true,
        json: async () => ({ someData: 'someValue' })
    }

    return Promise.resolve(defaultResponse);
})

global.fetch = mockFetch

describe('Task services testing', () => {

    beforeAll(async () => {
        await connectDB(process.env.DB_NAME_TEST_SERVICES);
        await collections.counter.deleteMany()
        await collections.counter.insertOne({count: 1})
    });

    beforeEach(async () => {
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

    it('it should return 401 if the body are invalid', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "",
            _status: "",
            _productList: [{
                "_codProduct": "000003",
                "_from": null,
                "_to": "000123"
            }]
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: 'Invalid request body. Please ensure all required fields are included and in the correct format.'})
    });

    it('it should return 401 if the task data are invalid', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "",
            _status: "",
            _productList: [{
                _codProduct: "000003",
                _from: null,
                _to: "000123",
                _quantity: 10
            }]
        }

        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: 'Invalid task data'})
    })

    it('it should return 401 if the product is not defined', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 20
            }, {
                _codProduct: "000004",
                _from: null,
                _to: "000124",
                _quantity: 30
            }]
        }

        mockFetch.mockResolvedValue({
            ok: false,
            status: 401
        });
        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not defined.' });
    });

    it('it should return 401 if the shelf is not defined', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 20
            }, {
                _codProduct: "000004",
                _from: null,
                _to: "000124",
                _quantity: 30
            }]
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200
        }).mockResolvedValueOnce({
            status: 401
        } )
        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Shelf not found.' });
    });

    it('it should return 401 if the product is not defined in a shelf', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 20
            }, {
                _codProduct: "000004",
                _from: null,
                _to: "000124",
                _quantity: 30
            }]
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ message: 'Product exists' })
        }).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ _productList: [
                    {
                        _codProduct: "000235",
                        _stock: 24
                    },
                    {
                        _codProduct: "000236",
                        _stock: 24
                    }
                ],
                _codShelf: "000123"})})
        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not defined in a shelf.' });
    })

    it('it should return 401 if the requested quantity exceeds the available stock for the product.', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 30
            }, {
                _codProduct: "000004",
                _from: null,
                _to: "000124",
                _quantity: 30
            }]
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ message: 'Product exists' })
        }).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ _productList: [
                    {
                        _codProduct: "000003",
                        _stock: 24
                    },
                    {
                        _codProduct: "000236",
                        _stock: 24
                    }
                ],
                _codShelf: "000123"})})
        await assignTask(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'The requested quantity exceeds the available stock for the product.' });
    });

    it('it should return 200 if registration is successful', async () => {
        const res = mockResponse()
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: null,
                _to: "000123",
                _quantity: 20
            }, {
                _codProduct: "000004",
                _from: null,
                _to: "000124",
                _quantity: 30
            }]
        }

        await assignTask(req, res)
        expect(res.json).not.toBeNull()
    });

    it('it should return 200 and the tasks assigned to this specific operator', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000002", _type: "Operational"}

        await getAll(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 200 and all tasks that are stored', async () => {
        const res = mockResponse()
        req.user = {_type: "Admin"}
        await getAll(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 200 and the task with the taskCode specified', async () => {
        const res = mockResponse()
        req.params = {codTask: "000543"}

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if the taskCode is wrong', async () => {
        const res = mockResponse()
        req.params = {codTask: "000877"}

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task not found"})
    })

    it('it should return 401 if the taskCode is not specified', async () => {
        const res = mockResponse()
        req.params = {codTask: ""}

        await getTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Invalid task data"})
    })

    it('it should return 200 and the task updated with a new status', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000002"}
        req.params = {codTask: "000543"}
        req.body = {_type: "Unloading"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if updating task status with task code that is not assigned to this specific operator', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000002"}
        req.params = {codTask: "000544"}
        req.body = {_status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "This operator do not have this specific task assigned"})
    })

    it('it should return 401 if one tries to updating a task status, but the operator do not have task assigned', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000003"}
        req.params = {codTask: "000543"}
        req.body = {_status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "This operator do not have this specific task assigned"})
    })

    it('it should return 401 if try to updating field that is not specified for the task ', async () => {
        const res = mockResponse()
        const req = {
            user: {
                _codUser: "000002"
            },
            params: {
                codTask: "000543"
            }, body: {
                _name: "Order 1"
            }
        };
        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Invalid request body. Please ensure all required fields are included and in the correct format."})
    })

    it('it should return 401 if try to updating task with a product that is not defined', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = {codTask: "000543"}
        req.body = {_codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000013",
                _from: "000123",
                _to: null,
                _quantity: 20
            }]}

        mockFetch.mockResolvedValue({
            ok: false,
            status: 401
        });
        await updateTaskByCode(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not defined.' });
    });

    it('it should return 401 if try to updating task with a shelf that is not defined', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = {codTask: "000543"}
        req.body = {_codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000013",
                _to: null,
                _quantity: 20
            }]}

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200
        }).mockResolvedValueOnce({
            status: 401
        } )
        await updateTaskByCode(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Shelf not found.' });
    })

    it('it should return 401 if try to updating task with a product that is not defined in a shelf', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = {codTask: "000543"}
        req.body = {_codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 20
            }]}

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ message: 'Product exists' })
        }).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ _productList: [
                    {
                        _codProduct: "000235",
                        _stock: 24
                    },
                    {
                        _codProduct: "000236",
                        _stock: 24
                    }
                ],
                _codShelf: "000123"})})
        await updateTaskByCode(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not defined in a shelf.' });
    })

    it('it should return 401 if try to updating task quantity exceeds the available stock for the product.', async () => {
        const res = mockResponse()
        req.user = { _codUser: "000002"}
        req.params = {codTask: "000543"}
        req.body = {
            _codOperator: "000006",
            _date: "14/03/2024",
            _type: "Unloading",
            _status: "pending",
            _productList: [{
                _codProduct: "000003",
                _from: "000123",
                _to: null,
                _quantity: 30
            }]
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ message: 'Product exists' })
        }).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ _productList: [
                    {
                        _codProduct: "000003",
                        _stock: 24
                    },
                    {
                        _codProduct: "000236",
                        _stock: 24
                    }
                ],
                _codShelf: "000123"})})
        await updateTaskByCode(req, res)

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'The requested quantity exceeds the available stock for the product.' });
    });

    it('it should return 200 if the admin try to update task with a new status', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000001", _type: "Admin"}
        req.params = {codTask: "000543"}
        req.body = {_status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).not.toBeNull()
    })

    it('it should return 401 if the admin try to update task that not exists', async () => {
        const res = mockResponse()
        req.user = {_codUser: "000001", _type: "Admin"}
        req.params = {codTask: "001543"}
        req.body = {_status: "Completed"}

        await updateTaskByCode(req, res)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "Task not found"})
    })

})