const jwt = require("jsonwebtoken");
const {connectDB, collections} = require("../src/config/dbConnection");
const path = require("path");
const fs = require("fs");
const {verifyToken} = require("../src/routes/authMiddleware");

const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
};

const req = {
    method: "",
    url: "",
    headers: {},
    user: null
};

const mockNext = jest.fn();
describe("verifyToken middleware", ()=>{
    beforeAll(async () => {
        process.env.NODE_ENV = "test"
        await connectDB(process.env.DB_NAME_TEST);
    });

    beforeEach(async() => {
        await collections.users.deleteMany()
        const jsonFilePath = path.resolve(__dirname, './Resources/MongoDB/WMS.User.json');
        const userData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        await collections.users.insertMany(userData)
        req.method = ""
        req.url = ""
    })


    it("should return 401 if token is not provided", async()=>{
        const res=mockResponse()
        await verifyToken (req,res,mockNext)
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Token not provided"})
    })

    it("should return 401 if token is invalid", async()=>{
        const res=mockResponse()
        const token= jwt.sign({ id:'000899'}, process.env.JWT_SECRET);
        req.headers={ authorization: `Bearer ${token}` }
        await verifyToken (req,res,mockNext)
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Invalid token"})
    })

    it("should return 401 if an operational user try to create a task", async()=>{
        req.method="POST"
        const res=mockResponse()
        const token= jwt.sign({ id:'000898'}, process.env.JWT_SECRET);
        req.headers={ authorization: `Bearer ${token}` }
        await verifyToken (req,res,mockNext)
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Only admin users can perform this action"})
    })

    it("should return 401 if an operational user try to access to all tasks created", async()=>{
        req.url="/all"
        const res=mockResponse()
        const token= jwt.sign({ id:'000898'}, process.env.JWT_SECRET);
        req.headers={ authorization: `Bearer ${token}` }
        await verifyToken (req,res,mockNext)
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Only admin users can perform this action"})
    })

    it("should return 401 if an operational user try to access to single tasks by code", async()=>{
        req.url="/:000005"
        const res=mockResponse()
        const token= jwt.sign({ id:'000898'}, process.env.JWT_SECRET);
        req.headers={ authorization: `Bearer ${token}` }
        await verifyToken (req,res,mockNext)
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Only admin users can perform this action"})
    })

    it("should call next if token is valid", async()=>{
        const res=mockResponse()
        const token=jwt.sign({ id:'000899'}, process.env.JWT_SECRET);
        req.headers={ authorization: `Bearer ${token}` };
        await verifyToken (req,res,()=>{
            expect(req.user._name).toEqual("Martin");
        });
    })

})